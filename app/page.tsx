"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CaretRight, Fire } from "@phosphor-icons/react/dist/ssr";
import { DECKS } from "@/lib/decks";
import { splitDue } from "@/lib/srs";
import {
  dailyCounts,
  deckProgress,
  totals,
  type DeckProgress,
  type Totals,
} from "@/lib/stats";
import {
  loadHistory,
  loadNotes,
  loadProgress,
  loadSettings,
  saveSettings,
  streak,
} from "@/lib/storage";
import type { DeckId } from "@/lib/types";
import { today } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  MeterLegend,
  ProgressMeter,
  StatTile,
  WeekBars,
} from "@/components/stats";

const DECK_IDS: DeckId[] = ["kanji", "word"];

type Stats = {
  due: Record<DeckId, { review: number; fresh: number }>;
  progress: Record<DeckId, DeckProgress>;
  week: { date: string; count: number }[];
  totals: Totals;
  streak: number;
  notes: number;
};

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [size, setSize] = useState(20);
  const now = today();

  useEffect(() => {
    const progress = loadProgress();
    const history = loadHistory();
    const nowDate = today();
    const due = {} as Stats["due"];
    const deckStats = {} as Stats["progress"];
    for (const deck of DECK_IDS) {
      const cards = DECKS[deck].cards;
      const { review, fresh } = splitDue(cards, progress, nowDate);
      due[deck] = { review: review.length, fresh: fresh.length };
      deckStats[deck] = deckProgress(cards, progress);
    }
    // localStorage 는 마운트 뒤에만 읽을 수 있어 여기서 상태를 채울 수밖에 없다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStats({
      due,
      progress: deckStats,
      week: dailyCounts(history, nowDate),
      totals: totals(history),
      streak: streak(history, nowDate),
      notes: Object.keys(loadNotes()).length,
    });
    setSize(loadSettings().sessionSize);
  }, []);

  function changeSize(v: number) {
    setSize(v);
    saveSettings({ sessionSize: v });
  }

  return (
    <main className="pt-safe pb-safe px-safe flex flex-col gap-4 p-5">
      <header className="flex items-end justify-between pt-6">
        <h1 className="text-2xl font-semibold">JLPT 암기</h1>
        {!!stats?.streak && (
          <span className="text-sub flex items-center gap-1 text-sm">
            <Fire size={16} weight="fill" className="text-warn" />
            {stats.streak}일 연속
          </span>
        )}
      </header>

      {DECK_IDS.map((deck) => {
        const c = stats?.due[deck];
        return (
          <Link key={deck} href={`/study/${deck}`}>
            <Card className="flex items-center justify-between p-5">
              <div>
                <p className="text-lg font-medium">{DECKS[deck].label}</p>
                <p className="text-sub mt-1 text-sm tabular-nums">
                  {c ? (
                    <>
                      복습 {c.review} · 새 카드 {c.fresh}
                    </>
                  ) : (
                    <span className="text-muted">…</span>
                  )}
                </p>
              </div>
              <CaretRight size={20} className="text-muted" />
            </Card>
          </Link>
        );
      })}

      {stats && (
        <>
          <Card className="flex flex-col gap-4 p-5">
            <p className="text-sm font-medium">진도</p>
            {DECK_IDS.map((deck) => (
              <ProgressMeter
                key={deck}
                label={DECKS[deck].label}
                data={stats.progress[deck]}
              />
            ))}
            <MeterLegend />
          </Card>

          <Card className="flex flex-col gap-3 p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium">최근 7일</p>
              <p className="text-muted text-xs tabular-nums">
                {stats.week.reduce((s, d) => s + d.count, 0)}장
              </p>
            </div>
            <WeekBars data={stats.week} today={now} />
          </Card>

          <Card className="grid grid-cols-4 gap-2 p-5">
            <StatTile value={stats.totals.days} unit="일" label="학습한 날" />
            <StatTile value={stats.totals.cards} unit="장" label="누적" />
            <StatTile
              value={stats.totals.minutes}
              unit="분"
              label="공부 시간"
            />
            <StatTile value={stats.totals.firstTry} unit="%" label="한 번에" />
          </Card>

          {stats.notes > 0 && (
            <p className="text-muted text-center text-xs">
              내가 쓴 암기법 {stats.notes}개
            </p>
          )}
        </>
      )}

      <Card className="p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm font-medium">한 세션 분량</span>
          <span className="text-accent text-sm tabular-nums">{size}장</span>
        </div>
        <input
          type="range"
          min={10}
          max={50}
          step={5}
          value={size}
          onChange={(e) => changeSize(Number(e.target.value))}
          // 슬라이더 막대는 얇아서 위아래로 여백을 줘 손가락으로 잡을 수 있게 한다
          className="accent-accent w-full py-3"
        />
        <p className="text-muted mt-2 text-xs">
          복습이 밀리면 절반까지 복습으로, 나머지는 새 카드로 채웁니다.
        </p>
      </Card>
    </main>
  );
}

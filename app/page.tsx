"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CaretRight, Fire } from "@phosphor-icons/react/dist/ssr";
import { DECKS } from "@/lib/decks";
import { splitDue } from "@/lib/srs";
import {
  loadHistory,
  loadProgress,
  loadSettings,
  saveSettings,
  streak,
} from "@/lib/storage";
import type { DeckId, HistoryEntry } from "@/lib/types";
import { today } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type Counts = Record<DeckId, { review: number; fresh: number }>;

export default function Home() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [size, setSize] = useState(20);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [days, setDays] = useState(0);

  useEffect(() => {
    const progress = loadProgress();
    const now = today();
    const next = {} as Counts;
    for (const deck of ["kanji", "word"] as DeckId[]) {
      const { review, fresh } = splitDue(DECKS[deck].cards, progress, now);
      next[deck] = { review: review.length, fresh: fresh.length };
    }
    const h = loadHistory();
    // localStorage 는 마운트 뒤에만 읽을 수 있어 여기서 상태를 채울 수밖에 없다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCounts(next);
    setHistory(h);
    setDays(streak(h, now));
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
        {days > 0 && (
          <span className="text-sub flex items-center gap-1 text-sm">
            <Fire size={16} weight="fill" className="text-warn" />
            {days}일 연속
          </span>
        )}
      </header>

      {(["kanji", "word"] as DeckId[]).map((deck) => {
        const c = counts?.[deck];
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

      {history.length > 0 && (
        <Card className="p-5">
          <p className="mb-3 text-sm font-medium">최근 기록</p>
          <ul className="flex flex-col gap-2">
            {history.slice(0, 7).map((h, i) => (
              <li
                key={i}
                className="text-sub flex justify-between text-sm tabular-nums"
              >
                <span>
                  {Number(h.date.slice(5, 7))}월 {Number(h.date.slice(8))}일 ·{" "}
                  {DECKS[h.deck].label}
                </span>
                <span className="text-muted">
                  {h.correct}/{h.total} · {Math.round(h.durationSec / 60)}분
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </main>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { DECKS } from "@/lib/decks";
import { buildSession, cardKey, grade, nextInterval } from "@/lib/srs";
import {
  appendHistory,
  loadNotes,
  loadProgress,
  loadSettings,
  saveNotes,
  saveProgress,
} from "@/lib/storage";
import type { Card, DeckId, ProgressMap } from "@/lib/types";
import { today } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Flashcard } from "@/components/flashcard";

export function Session({ deck }: { deck: DeckId }) {
  const [queue, setQueue] = useState<Card[] | null>(null);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [reveal, setReveal] = useState({ meaning: false, reading: false });
  const [done, setDone] = useState<{ total: number; correct: number } | null>(
    null,
  );
  const total = useRef(0);
  const correct = useRef(0);
  const startedAt = useRef(Date.now());

  // localStorage 는 마운트 후에만 읽을 수 있다(SSR 불일치 방지)
  useEffect(() => {
    const p = loadProgress();
    const session = buildSession(
      DECKS[deck].cards,
      p,
      loadSettings().sessionSize,
    );
    total.current = session.length;
    startedAt.current = Date.now();
    setProgress(p);
    setNotes(loadNotes());
    setQueue(session);
  }, [deck]);

  const card = queue?.[0];
  const remaining = queue?.length ?? 0;
  const answered = total.current - remaining;

  function answer(known: boolean) {
    if (!card || !queue) return;
    const key = cardKey(card);
    const next = { ...progress, [key]: grade(progress[key], known, today()) };
    setProgress(next);
    saveProgress(next);

    // 모르는 카드는 큐 뒤로 보내 이번 세션 안에서 다시 만난다
    const rest = known ? queue.slice(1) : [...queue.slice(1), card];
    if (known) correct.current += 1;
    setReveal({ meaning: false, reading: false });

    if (rest.length === 0) {
      appendHistory({
        date: today(),
        deck,
        total: total.current,
        correct: correct.current,
        durationSec: Math.round((Date.now() - startedAt.current) / 1000),
      });
      setDone({ total: total.current, correct: correct.current });
    }
    setQueue(rest);
  }

  function setNote(key: string, value: string) {
    const next = { ...notes, [key]: value };
    setNotes(next);
    saveNotes(next);
  }

  const dueLabel = useMemo(
    () => (card ? nextInterval(progress[cardKey(card)]) : 0),
    [card, progress],
  );

  if (queue === null) {
    return <div className="text-muted p-8 text-center text-sm">불러오는 중…</div>;
  }

  if (done) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-3xl font-semibold">오늘치 끝</p>
        <p className="text-sub">
          {done.total}장 중 {done.correct}장을 한 번에 맞혔어요
        </p>
        <Link href="/">
          <Button variant="primary" size="lg">
            홈으로
          </Button>
        </Link>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-sub">오늘 학습할 카드가 없어요.</p>
        <Link href="/">
          <Button>홈으로</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-3 p-4">
        <Link href="/" aria-label="홈으로" className="text-sub">
          <ArrowLeft size={22} />
        </Link>
        <span className="text-muted text-sm tabular-nums">
          {answered}/{total.current}
        </span>
        <div className="bg-elev h-1.5 flex-1 overflow-hidden rounded-full">
          <div
            className="bg-accent h-full transition-[width]"
            style={{ width: `${(answered / Math.max(total.current, 1)) * 100}%` }}
          />
        </div>
      </header>

      <Flashcard
        card={card}
        showMeaning={reveal.meaning}
        showReading={reveal.reading}
        onReveal={(f) => setReveal((r) => ({ ...r, [f]: true }))}
        notes={notes}
        onNote={setNote}
      />

      <div className="flex gap-2 p-4 pb-6">
        <Button size="lg" className="flex-1" onClick={() => answer(false)}>
          다시 학습
        </Button>
        <Button
          size="lg"
          variant="primary"
          className="flex-1"
          onClick={() => answer(true)}
        >
          알고있음
          <span className="block text-xs opacity-80">{dueLabel}일 후 복습</span>
        </Button>
      </div>
    </div>
  );
}

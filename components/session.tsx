"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowCounterClockwise,
  ArrowLeft,
  Eye,
  EyeSlash,
  PencilSimple,
} from "@phosphor-icons/react/dist/ssr";
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
import { cn, today } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Flashcard,
  type Reveal,
  type RevealField,
} from "@/components/flashcard";
import { WritingPad } from "@/components/writing-pad";

const HIDDEN: Reveal = { meaning: false, reading: false, mnemonic: false };
const SHOWN: Reveal = { meaning: true, reading: true, mnemonic: true };

const REVEAL_BUTTONS: {
  field: RevealField;
  label: string;
  kanjiLabel?: string;
}[] = [
  { field: "meaning", label: "의미" },
  { field: "reading", label: "히라가나", kanjiLabel: "음·훈" },
  { field: "mnemonic", label: "연상법" },
];

export function Session({ deck }: { deck: DeckId }) {
  const [queue, setQueue] = useState<Card[] | null>(null);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [reveal, setReveal] = useState<Reveal>(HIDDEN);
  const [writing, setWriting] = useState(false);
  const [done, setDone] = useState<{ total: number; correct: number } | null>(
    null,
  );
  const [total, setTotal] = useState(0);
  const correct = useRef(0);
  // 렌더 중에 Date.now() 를 부르지 않도록 세션 시작 시점에 채운다
  const startedAt = useRef(0);

  // localStorage 는 마운트 후에만 읽을 수 있다(SSR 불일치 방지)
  useEffect(() => {
    const p = loadProgress();
    const session = buildSession(
      DECKS[deck].cards,
      p,
      loadSettings().sessionSize,
    );
    startedAt.current = Date.now();
    // localStorage 는 마운트 뒤에만 읽을 수 있어 여기서 상태를 채울 수밖에 없다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTotal(session.length);
    setProgress(p);
    setNotes(loadNotes());
    setQueue(session);
  }, [deck]);

  const card = queue?.[0];
  const allShown = reveal.meaning && reveal.reading && reveal.mnemonic;
  const anyShown = reveal.meaning || reveal.reading || reveal.mnemonic;
  const show = (f: RevealField) => setReveal((r) => ({ ...r, [f]: true }));
  const remaining = queue?.length ?? 0;
  const answered = total - remaining;

  function answer(known: boolean) {
    if (!card || !queue) return;
    const key = cardKey(card);
    const next = { ...progress, [key]: grade(progress[key], known, today()) };
    setProgress(next);
    saveProgress(next);

    setWriting(false);
    // 모르는 카드는 큐 뒤로 보내 이번 세션 안에서 다시 만난다
    const rest = known ? queue.slice(1) : [...queue.slice(1), card];
    if (known) correct.current += 1;
    setReveal(HIDDEN);

    if (rest.length === 0) {
      appendHistory({
        date: today(),
        deck,
        total,
        correct: correct.current,
        durationSec: Math.round((Date.now() - startedAt.current) / 1000),
      });
      setDone({ total, correct: correct.current });
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
    return (
      <div className="text-muted p-8 text-center text-sm">불러오는 중…</div>
    );
  }

  if (done) {
    return (
      <div className="pt-safe pb-safe flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
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
      <div className="pt-safe pb-safe flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-sub">오늘 학습할 카드가 없어요.</p>
        <Link href="/">
          <Button>홈으로</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col px-safe">
      <header className="pt-safe flex items-center gap-3 px-4 py-2">
        <Link href="/" aria-label="홈으로" className="text-sub">
          <ArrowLeft size={22} />
        </Link>
        <span className="text-muted text-sm tabular-nums">
          {answered}/{total}
        </span>
        <div className="bg-elev h-1.5 flex-1 overflow-hidden rounded-full">
          <div
            className="bg-accent h-full transition-[width]"
            style={{ width: `${(answered / Math.max(total, 1)) * 100}%` }}
          />
        </div>
        <button
          onClick={() => setWriting(true)}
          aria-label="손으로 써보기"
          className="text-sub -mr-1 flex h-10 w-10 items-center justify-center"
        >
          <PencilSimple size={20} />
        </button>
        <button
          onClick={() => setReveal(allShown ? HIDDEN : SHOWN)}
          aria-label={allShown ? "전부 가리기" : "전부 보기"}
          className={cn(
            "-mr-1 flex h-10 w-10 items-center justify-center",
            allShown ? "text-accent" : "text-sub",
          )}
        >
          {allShown ? <Eye size={20} /> : <EyeSlash size={20} />}
        </button>
      </header>

      <Flashcard card={card} reveal={reveal} notes={notes} onNote={setNote} />

      {writing && (
        <WritingPad
          guide={card.deck === "kanji" ? card.char : card.word}
          onClose={() => setWriting(false)}
        />
      )}

      <div className="bg-bg border-border pb-safe fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-lg border-t px-4 pt-3">
        <div className="mb-2 flex gap-2">
          <Button
            variant="outline"
            aria-label="공개한 것 다시 가리기"
            className="px-3"
            disabled={!anyShown}
            onClick={() => setReveal(HIDDEN)}
          >
            <ArrowCounterClockwise size={18} />
          </Button>
          {REVEAL_BUTTONS.map(({ field, label, kanjiLabel }) => (
            <Button
              key={field}
              variant="outline"
              className="flex-1 px-2"
              disabled={reveal[field]}
              onClick={() => show(field)}
            >
              {card.deck === "kanji" ? (kanjiLabel ?? label) : label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
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
            <span className="block text-xs opacity-80">
              {dueLabel}일 후 복습
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

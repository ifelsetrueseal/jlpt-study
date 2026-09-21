"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowCounterClockwise,
  ArrowLeft,
  Eye,
  EyeSlash,
  PencilSimple,
} from "@phosphor-icons/react/dist/ssr";
import { kanjiIn } from "@/lib/decks";
import { useStudySession } from "@/lib/use-study-session";
import { warmUpVoices } from "@/lib/speech";
import type { Card, DeckId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Flashcard,
  type Reveal,
  type RevealField,
} from "@/components/flashcard";
import { NotesProvider } from "@/components/notes-context";
import { WritingPad } from "@/components/writing-pad";
import { useEffect } from "react";

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

/** 쓰기 연습에 깔 본보기. 단어의 히라가나까지 넣으면 칸이 빽빽해진다. */
function guideOf(card: Card): string {
  if (card.deck === "kanji") return card.char;
  return kanjiIn(card.word)
    .map((k) => k.char)
    .join("");
}

export function Session({ deck }: { deck: DeckId }) {
  const { card, result, loading, total, answered, dueDays, answer } =
    useStudySession(deck);
  const [reveal, setReveal] = useState<Reveal>(HIDDEN);
  const [writing, setWriting] = useState(false);

  // 첫 탭에서 일본어 목소리를 못 골라 기본 목소리로 읽히는 걸 막는다
  useEffect(() => warmUpVoices(), []);

  function grade(known: boolean) {
    setReveal(HIDDEN);
    setWriting(false);
    answer(known);
  }

  if (loading) {
    return (
      <div className="text-muted p-8 text-center text-sm">불러오는 중…</div>
    );
  }

  if (result) {
    return (
      <Centered>
        <p className="text-3xl font-semibold">오늘치 끝</p>
        <p className="text-sub">
          {result.total}장 중 {result.correct}장을 한 번에 맞혔어요
        </p>
        <Link href="/">
          <Button variant="primary" size="lg">
            홈으로
          </Button>
        </Link>
      </Centered>
    );
  }

  if (!card) {
    return (
      <Centered>
        <p className="text-sub">오늘 학습할 카드가 없어요.</p>
        <Link href="/">
          <Button>홈으로</Button>
        </Link>
      </Centered>
    );
  }

  const allShown = reveal.meaning && reveal.reading && reveal.mnemonic;
  const anyShown = reveal.meaning || reveal.reading || reveal.mnemonic;

  return (
    <NotesProvider>
      <div className="flex h-dvh flex-col pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <header className="mt-[env(safe-area-inset-top)] flex items-center gap-3 px-4 py-2">
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
          <IconButton onClick={() => setWriting(true)} label="손으로 써보기">
            <PencilSimple size={20} />
          </IconButton>
          <IconButton
            onClick={() => setReveal(allShown ? HIDDEN : SHOWN)}
            label={allShown ? "전부 가리기" : "전부 보기"}
            active={allShown}
          >
            {allShown ? <Eye size={20} /> : <EyeSlash size={20} />}
          </IconButton>
        </header>

        <Flashcard card={card} reveal={reveal} />

        {writing && (
          <WritingPad guide={guideOf(card)} onClose={() => setWriting(false)} />
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
                onClick={() => setReveal((r) => ({ ...r, [field]: true }))}
              >
                {card.deck === "kanji" ? (kanjiLabel ?? label) : label}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="lg" className="flex-1" onClick={() => grade(false)}>
              다시 학습
            </Button>
            <Button
              size="lg"
              variant="primary"
              className="flex-1"
              onClick={() => grade(true)}
            >
              알고있음
              <span className="block text-xs opacity-80">
                {dueDays}일 후 복습
              </span>
            </Button>
          </div>
        </div>
      </div>
    </NotesProvider>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
      {children}
    </div>
  );
}

function IconButton({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "-mr-1 flex h-10 w-10 items-center justify-center",
        active ? "text-accent" : "text-sub",
      )}
    >
      {children}
    </button>
  );
}

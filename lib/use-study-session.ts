"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DECKS } from "@/lib/decks";
import { buildSession, cardKey, grade, nextInterval } from "@/lib/srs";
import {
  appendHistory,
  loadProgress,
  loadSettings,
  saveProgress,
} from "@/lib/storage";
import type { Card, DeckId, ProgressMap } from "@/lib/types";
import { today } from "@/lib/utils";

export type SessionResult = { total: number; correct: number };

/**
 * 세션 진행만 책임진다 — 큐를 만들고, 채점하고, 끝나면 기록을 남긴다.
 * 무엇을 공개했는지·쓰기 패드를 열었는지 같은 화면 상태는 화면이 갖는다.
 */
export function useStudySession(deck: DeckId) {
  const [queue, setQueue] = useState<Card[] | null>(null);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [total, setTotal] = useState(0);
  const [result, setResult] = useState<SessionResult | null>(null);
  const correct = useRef(0);
  // 렌더 중에 Date.now() 를 부르지 않도록 세션 시작 시점에 채운다
  const startedAt = useRef(0);

  useEffect(() => {
    const saved = loadProgress();
    const session = buildSession(
      DECKS[deck].cards,
      saved,
      loadSettings().sessionSize,
    );
    startedAt.current = Date.now();
    // localStorage 는 마운트 뒤에만 읽을 수 있어 여기서 상태를 채울 수밖에 없다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTotal(session.length);
    setProgress(saved);
    setQueue(session);
  }, [deck]);

  const card = queue?.[0];

  const answer = useCallback(
    (known: boolean) => {
      if (!card || !queue) return;
      const now = today();
      const next = {
        ...progress,
        [cardKey(card)]: grade(progress[cardKey(card)], known, now),
      };
      setProgress(next);
      saveProgress(next);

      // 모르는 카드는 큐 뒤로 보내 이번 세션 안에서 다시 만난다
      const rest = known ? queue.slice(1) : [...queue.slice(1), card];
      if (known) correct.current += 1;

      if (rest.length === 0) {
        const finished = { total, correct: correct.current };
        appendHistory({
          date: now,
          deck,
          ...finished,
          durationSec: Math.round((Date.now() - startedAt.current) / 1000),
        });
        setResult(finished);
      }
      setQueue(rest);
    },
    [card, queue, progress, total, deck],
  );

  return {
    /** 아직 불러오는 중이면 null */
    card,
    /** 세션이 끝났으면 결과, 아니면 null */
    result,
    loading: queue === null,
    total,
    answered: total - (queue?.length ?? 0),
    /** '알고있음' 을 지금 누르면 며칠 뒤에 다시 나오는지 */
    dueDays: card ? nextInterval(progress[cardKey(card)]) : 0,
    answer,
  };
}

import { cardKey, INTERVALS } from "./srs";
import type { Card, HistoryEntry, ProgressMap } from "./types";

/** stage 가 여기 이상이면 '익혔다'로 센다 — 복습 간격 21일 이상 */
const LEARNED_STAGE = 3;

export type DeckProgress = {
  total: number;
  /** 한 번이라도 학습한 카드 */
  started: number;
  /** 복습 간격이 21일 이상까지 벌어진 카드 */
  learned: number;
};

export function deckProgress(
  cards: Card[],
  progress: ProgressMap,
): DeckProgress {
  let started = 0;
  let learned = 0;
  for (const card of cards) {
    const p = progress[cardKey(card)];
    if (!p) continue;
    started += 1;
    if (p.stage >= LEARNED_STAGE) learned += 1;
  }
  return { total: cards.length, started, learned };
}

export type Totals = {
  days: number;
  cards: number;
  minutes: number;
  /** 다시 학습을 안 누르고 한 번에 맞힌 비율(%) */
  firstTry: number;
};

export function totals(history: HistoryEntry[]): Totals {
  let cards = 0;
  let correct = 0;
  let seconds = 0;
  for (const h of history) {
    cards += h.total;
    correct += h.correct;
    seconds += h.durationSec;
  }
  return {
    days: new Set(history.map((h) => h.date)).size,
    cards,
    minutes: Math.round(seconds / 60),
    firstTry: cards ? Math.round((correct / cards) * 100) : 0,
  };
}

/** 복습 단계별 카드 수. INTERVALS 와 길이가 같다. */
export function stageCounts(progress: ProgressMap, deck: string): number[] {
  const out = new Array(INTERVALS.length).fill(0);
  for (const [key, p] of Object.entries(progress)) {
    if (!key.startsWith(`${deck}:`)) continue;
    out[Math.min(p.stage, INTERVALS.length - 1)] += 1;
  }
  return out;
}

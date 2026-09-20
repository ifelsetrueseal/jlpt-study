import type { Card, Progress, ProgressMap } from "./types";
import { addDays, today } from "./utils";

/** stage 별 복습 간격(일). 마지막 stage 에 도달하면 더 안 늘어난다. */
export const INTERVALS = [1, 3, 7, 21, 60];

export function cardKey(card: Card): string {
  return `${card.deck}:${card.id}`;
}

/** "알고있음" 을 지금 누르면 며칠 뒤에 다시 나오는지. 버튼 라벨용. */
export function nextInterval(p: Progress | undefined): number {
  return INTERVALS[Math.min(p?.stage ?? 0, INTERVALS.length - 1)];
}

/**
 * 채점. known=false 면 stage 를 0 으로 되돌리고 오늘 다시 나오게 한다
 * (세션 큐 재삽입은 호출부 책임).
 */
export function grade(
  p: Progress | undefined,
  known: boolean,
  now: string = today(),
): Progress {
  const prev: Progress = p ?? { stage: 0, due: now, wrong: 0, seen: 0 };
  const seen = prev.seen + 1;
  if (!known) {
    return { stage: 0, due: now, wrong: prev.wrong + 1, seen };
  }
  return {
    stage: Math.min(prev.stage + 1, INTERVALS.length - 1),
    due: addDays(now, nextInterval(prev)),
    wrong: prev.wrong,
    seen,
  };
}

/** Fisher-Yates. 원본은 안 건드린다. */
export function shuffle<T>(items: T[], rand: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function splitDue(
  deck: Card[],
  progress: ProgressMap,
  now: string = today(),
): { review: Card[]; fresh: Card[] } {
  const review: Card[] = [];
  const fresh: Card[] = [];
  for (const card of deck) {
    const p = progress[cardKey(card)];
    if (!p) fresh.push(card);
    else if (p.due <= now) review.push(card);
  }
  return { review, fresh };
}

/**
 * 세션 큐 구성. 복습을 절반까지 먼저 담고 남은 자리를 새 카드로 채운다.
 * 한쪽이 모자라면 다른 쪽이 그만큼 더 가져간다 — 1일차엔 전부 새 카드,
 * 2일차부터 복습이 섞여 들어온다.
 */
export function buildSession(
  deck: Card[],
  progress: ProgressMap,
  size: number,
  now: string = today(),
  rand: () => number = Math.random,
): Card[] {
  const { review, fresh } = splitDue(deck, progress, now);
  const half = Math.floor(size / 2);
  const takeReview = Math.min(review.length, Math.max(half, size - fresh.length));
  const takeFresh = Math.min(fresh.length, size - takeReview);
  return shuffle(
    [...review.slice(0, takeReview), ...fresh.slice(0, takeFresh)],
    rand,
  );
}

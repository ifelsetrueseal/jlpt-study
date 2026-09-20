import { expect, test } from "vitest";
import { dailyCounts, deckProgress, stageCounts, totals } from "./stats";
import type { Card, HistoryEntry, ProgressMap } from "./types";

const cards = (n: number): Card[] =>
  Array.from({ length: n }, (_, i) => ({
    deck: "kanji" as const,
    id: `k${i}`,
    char: `k${i}`,
    korMeaning: "",
    on: [],
    kun: [],
    radical: { char: "", name: "" },
    parts: [],
    mnemonic: "",
  }));

test("진도는 학습 시작한 카드와 익힌 카드를 나눠 센다", () => {
  const progress: ProgressMap = {
    "kanji:k0": { stage: 0, due: "2026-01-10", wrong: 1, seen: 1 },
    "kanji:k1": { stage: 2, due: "2026-01-17", wrong: 0, seen: 3 },
    "kanji:k2": { stage: 3, due: "2026-01-31", wrong: 0, seen: 4 },
    "kanji:k3": { stage: 4, due: "2026-03-11", wrong: 0, seen: 6 },
  };
  expect(deckProgress(cards(10), progress)).toEqual({
    total: 10,
    started: 4,
    learned: 2, // stage 3 이상만
  });
});

test("일별 학습량은 하루 여러 세션을 합치고 빈 날은 0 으로 채운다", () => {
  const history: HistoryEntry[] = [
    { date: "2026-01-10", deck: "kanji", total: 20, correct: 18, durationSec: 300 },
    { date: "2026-01-10", deck: "word", total: 10, correct: 9, durationSec: 120 },
    { date: "2026-01-07", deck: "kanji", total: 5, correct: 5, durationSec: 60 },
  ];
  const week = dailyCounts(history, "2026-01-10", 7);
  expect(week).toHaveLength(7);
  expect(week[6]).toEqual({ date: "2026-01-10", count: 30 }); // 마지막 칸이 오늘
  expect(week[3]).toEqual({ date: "2026-01-07", count: 5 });
  expect(week[0]).toEqual({ date: "2026-01-04", count: 0 });
});

test("누적은 학습한 날·장수·분·한 번에 맞힌 비율", () => {
  const history: HistoryEntry[] = [
    { date: "2026-01-10", deck: "kanji", total: 20, correct: 15, durationSec: 300 },
    { date: "2026-01-10", deck: "word", total: 20, correct: 17, durationSec: 240 },
    { date: "2026-01-09", deck: "kanji", total: 10, correct: 8, durationSec: 120 },
  ];
  expect(totals(history)).toEqual({
    days: 2, // 같은 날 두 세션은 하루
    cards: 50,
    minutes: 11, // 660초
    firstTry: 80, // 40/50
  });
});

test("단계 분포는 해당 덱만 세고 상한을 넘지 않는다", () => {
  const progress: ProgressMap = {
    "kanji:a": { stage: 0, due: "", wrong: 0, seen: 1 },
    "kanji:b": { stage: 0, due: "", wrong: 0, seen: 1 },
    "kanji:c": { stage: 4, due: "", wrong: 0, seen: 9 },
    "word:d": { stage: 2, due: "", wrong: 0, seen: 2 },
  };
  expect(stageCounts(progress, "kanji")).toEqual([2, 0, 0, 0, 1]);
  expect(stageCounts(progress, "word")).toEqual([0, 0, 1, 0, 0]);
});

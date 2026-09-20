import { expect, test } from "vitest";
import { buildSession, grade, INTERVALS, splitDue } from "./srs";
import type { Card, ProgressMap } from "./types";

const NOW = "2026-01-10";
const deck = (n: number): Card[] =>
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

test("진행도가 없으면 세션은 전부 새 카드", () => {
  const session = buildSession(deck(50), {}, 20, NOW);
  expect(session).toHaveLength(20);
  expect(splitDue(session, {}, NOW).fresh).toHaveLength(20);
});

test("복습 due 카드와 새 카드가 섞이고 총합은 size 를 안 넘는다", () => {
  const cards = deck(50);
  const progress: ProgressMap = {};
  // 앞의 6장은 오늘 복습 대상, 다음 4장은 아직 멀었다
  for (let i = 0; i < 6; i++)
    progress[`kanji:k${i}`] = { stage: 1, due: NOW, wrong: 0, seen: 1 };
  for (let i = 6; i < 10; i++)
    progress[`kanji:k${i}`] = { stage: 2, due: "2026-02-01", wrong: 0, seen: 1 };

  const session = buildSession(cards, progress, 20, NOW);
  expect(session).toHaveLength(20);
  const { review, fresh } = splitDue(session, progress, NOW);
  expect(review).toHaveLength(6);
  expect(fresh).toHaveLength(14);
  // 아직 안 익은 카드는 절대 안 들어온다
  expect(session.some((c) => c.id === "k7")).toBe(false);
});

test("복습이 밀리면 복습이 세션의 절반까지만 차지한다", () => {
  const cards = deck(50);
  const progress: ProgressMap = {};
  for (let i = 0; i < 40; i++)
    progress[`kanji:k${i}`] = { stage: 1, due: NOW, wrong: 0, seen: 1 };

  const session = buildSession(cards, progress, 20, NOW);
  const { review, fresh } = splitDue(session, progress, NOW);
  expect(review).toHaveLength(10);
  expect(fresh).toHaveLength(10);
});

test("알고있음을 반복하면 간격이 1→3→7→21→60 으로 늘고 거기서 멈춘다", () => {
  let p = grade(undefined, true, NOW); // stage 0 -> 1일 뒤
  expect(p.due).toBe("2026-01-11");
  const gaps = [p.due];
  for (let i = 0; i < 5; i++) {
    p = grade(p, true, NOW);
    gaps.push(p.due);
  }
  expect(gaps).toEqual([
    "2026-01-11", // +1
    "2026-01-13", // +3
    "2026-01-17", // +7
    "2026-01-31", // +21
    "2026-03-11", // +60
    "2026-03-11", // stage 상한, 계속 +60
  ]);
  expect(p.stage).toBe(INTERVALS.length - 1);
});

test("다시 학습은 stage 를 0 으로 되돌리고 오늘로 당긴다", () => {
  const known = grade(grade(undefined, true, NOW), true, NOW);
  const again = grade(known, false, NOW);
  expect(again).toMatchObject({ stage: 0, due: NOW, wrong: 1, seen: 3 });
});

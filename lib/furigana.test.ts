import { expect, test } from "vitest";
import { stripFurigana } from "./furigana";
import { plainReading } from "./speech";

test("대괄호 후리가나를 떼면 읽어줄 수 있는 문장이 된다", () => {
  expect(stripFurigana("道[みち]に迷[まよ]ったので、交番[こうばん]で聞[き]きました。")).toBe(
    "道に迷ったので、交番で聞きました。",
  );
  expect(stripFurigana("ご飯[はん]を食[た]べる")).toBe("ご飯を食べる");
  expect(stripFurigana("후리가나 없는 문장")).toBe("후리가나 없는 문장");
});

test("훈독의 오쿠리가나 점은 발음할 때 뺀다", () => {
  expect(plainReading("やす.む")).toBe("やすむ");
  expect(plainReading("いろ")).toBe("いろ");
});

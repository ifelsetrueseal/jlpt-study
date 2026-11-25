import type { Word } from "./types";

const READING_TYPES = new Set(["훈독", "음독", "혼합"]);

export function validateWords(input: unknown): Word[] {
  if (!Array.isArray(input)) throw new Error("단어 데이터가 배열이 아닙니다");
  for (const item of input) {
    if (!item || typeof item !== "object") throw new Error("단어 데이터 형식이 올바르지 않습니다");
    const word = item as Record<string, unknown>;
    if (typeof word.word !== "string" || !word.word.trim()) throw new Error("단어 표기가 비어 있습니다");
    if (typeof word.reading !== "string" || !word.reading.trim()) throw new Error("단어 읽기가 비어 있습니다");
    if (typeof word.meaning !== "string" || !word.meaning.trim()) throw new Error(`${word.word}: 뜻이 비어 있습니다`);
    if (typeof word.readingType !== "string" || !READING_TYPES.has(word.readingType)) {
      throw new Error(`${word.word}: 읽기 유형이 올바르지 않습니다`);
    }
  }
  return input as Word[];
}

import kanjiData from "@/data/kanji.json";
import wordData from "@/data/words.json";
import type { Card, DeckId, Kanji, Word } from "./types";

/*
 * 덱 소스. 지금은 JSON 번들, 나중에 Supabase 로 바꿀 때 이 파일만 건드린다.
 */

export const KANJI: Kanji[] = kanjiData as Kanji[];
export const WORDS: Word[] = wordData as Word[];

const kanjiByChar = new Map(KANJI.map((k) => [k.char, k]));

export const DECKS: Record<DeckId, { label: string; cards: Card[] }> = {
  kanji: {
    label: "한자",
    cards: KANJI.map((k) => ({ ...k, deck: "kanji", id: k.char })),
  },
  word: {
    label: "단어",
    cards: WORDS.map((w) => ({ ...w, deck: "word", id: w.word })),
  },
};

export const isDeckId = (v: string): v is DeckId => v === "kanji" || v === "word";

/** 단어에 들어있는 한자들. 단어 쪽에 따로 필드를 두지 않고 여기서 뽑는다. */
export function kanjiIn(word: string): Kanji[] {
  const seen = new Set<string>();
  const out: Kanji[] = [];
  for (const ch of word) {
    const k = kanjiByChar.get(ch);
    if (k && !seen.has(ch)) {
      seen.add(ch);
      out.push(k);
    }
  }
  return out;
}

export const lookupKanji = (char: string) => kanjiByChar.get(char);

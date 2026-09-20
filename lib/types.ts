export type DeckId = "kanji" | "word";

export type Part = { char: string; name: string };

export type Kanji = {
  char: string;
  /** "쉴 휴" */
  korMeaning: string;
  on: string[];
  kun: string[];
  radical: Part;
  /** 한자를 쪼갠 조각들. 연상 스토리의 재료. */
  parts: Part[];
  /** 부수 연상 암기법 기본안. 사용자가 메모로 덮어쓸 수 있다. */
  mnemonic: string;
};

export type ReadingType = "훈독" | "음독" | "혼합";

export type Word = {
  word: string;
  reading: string;
  meaning: string;
  /** 이 단어에서 실제로 쓰인 읽기 계열 */
  readingType: ReadingType;
  example?: {
    /** 후리가나는 대괄호 표기: "道[みち]に迷[まよ]った" */
    jp: string;
    ko: string;
  };
};

export type Card =
  | ({ deck: "kanji"; id: string } & Kanji)
  | ({ deck: "word"; id: string } & Word);

/** stage 는 INTERVALS 인덱스. due 는 "YYYY-MM-DD". */
export type Progress = {
  stage: number;
  due: string;
  wrong: number;
  seen: number;
};

/** key 는 `${deck}:${id}` */
export type ProgressMap = Record<string, Progress>;

export type HistoryEntry = {
  date: string;
  deck: DeckId;
  total: number;
  correct: number;
  durationSec: number;
};

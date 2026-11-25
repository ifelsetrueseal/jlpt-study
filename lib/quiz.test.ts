import { expect, test } from "vitest";
import { gradeChoice, validateQuestions, type Question } from "./quiz";
import { QUESTIONS } from "../data/questions";
import words from "../data/words.json";
import wordBatch02 from "../data/words-batch-02.json";
import { validateWords } from "./words";

const question: Question = {
  id: "q1",
  type: "reading",
  prompt: "「薬」の読み方はどれですか。",
  choices: ["くせり", "くすり", "くさ", "くし"],
  answerIndex: 1,
  explanationKo: "薬은 くすり라고 읽습니다.",
  source: { type: "textbook", image: "IMG_3194.jpg", questionNumber: 8 },
  choiceFeedback: [
    { reading: "くせり", translationKo: "올바른 읽기가 아님", feedbackKo: "정답은 くすり입니다." },
    { reading: "くすり", translationKo: "약", feedbackKo: "올바른 읽기입니다." },
    { reading: "くさ", translationKo: "풀", feedbackKo: "草의 읽기입니다." },
    { reading: "くし", translationKo: "빗", feedbackKo: "櫛의 읽기입니다." },
  ],
};

test("선택한 보기의 정오답과 피드백을 돌려준다", () => {
  expect(gradeChoice(question, 1)).toMatchObject({ correct: true, selectedIndex: 1 });
  expect(gradeChoice(question, 0)).toMatchObject({ correct: false, selectedIndex: 0 });
});

test("보기 범위를 벗어난 선택은 거부한다", () => {
  expect(() => gradeChoice(question, 4)).toThrow("선택지 인덱스가 올바르지 않습니다");
});

test("문제와 보기별 피드백 개수가 다르면 거부한다", () => {
  expect(() => validateQuestions([{ ...question, choiceFeedback: [] }])).toThrow(
    "q1: 보기와 피드백 개수가 다릅니다",
  );
});

test("정답 인덱스는 정수여야 한다", () => {
  expect(() => validateQuestions([{ ...question, answerIndex: 1.5 }])).toThrow(
    "q1: 정답 인덱스가 올바르지 않습니다",
  );
});

test("보기별 해석이 비어 있으면 거부한다", () => {
  const malformed = {
    ...question,
    choiceFeedback: question.choiceFeedback.map((item, index) =>
      index === 0 ? { ...item, translationKo: "" } : item,
    ),
  };
  expect(() => validateQuestions([malformed])).toThrow("q1: 보기 해석이 비어 있습니다");
});

test("사용법 문제는 출제 단어를 질문에 보여줘야 한다", () => {
  expect(() =>
    validateQuestions([{ ...question, type: "usage", target: "薬", prompt: "알맞은 문장을 고르세요." }]),
  ).toThrow("q1: 출제 대상이 질문에 표시되지 않았습니다");
});

test("단어 데이터의 필수 필드와 읽기 유형을 검증한다", () => {
  expect(() =>
    validateWords([{ word: "薬", reading: "", meaning: "약", readingType: "음독" }]),
  ).toThrow("단어 읽기가 비어 있습니다");
  expect(() =>
    validateWords([{ word: "薬", reading: "くすり", meaning: "약", readingType: "잘못됨" }]),
  ).toThrow("薬: 읽기 유형이 올바르지 않습니다");
});

test("교재 64문제와 N4 응용 5문제를 제공한다", () => {
  expect(QUESTIONS).toHaveLength(69);
  expect(QUESTIONS.filter((item) => item.source.type === "textbook")).toHaveLength(64);
  expect(QUESTIONS.every((item) => item.choices.length === 4)).toBe(true);
});

test("검수한 교재 어휘 24개가 단어 덱에 모두 있다", () => {
  const textbookWords = [
    "眠い", "石", "習う", "忘れる", "暗い", "今度", "顔", "薬",
    "食料品", "意見", "安全", "喜ぶ", "空港", "禁煙", "用意", "女性",
    "大切", "駐車場", "独身", "引っ越す", "必要", "秘密", "増える", "柔らかい",
  ];
  const wordsInDeck = new Set(words.map((item) => item.word));
  expect(textbookWords.filter((word) => !wordsInDeck.has(word))).toEqual([]);
});

test("추가 교재 단어는 기존 덱과 중복 없이 합쳐진다", () => {
  const allWords = [...words, ...wordBatch02];
  expect(allWords).toHaveLength(952);
  expect(new Set(allWords.map((item) => item.word)).size).toBe(allWords.length);
});

test("모든 문제 ID가 고유하고 보기 해설이 완전하다", () => {
  expect(new Set(QUESTIONS.map((item) => item.id)).size).toBe(QUESTIONS.length);
  expect(
    QUESTIONS.every((item) =>
      item.choiceFeedback.every(
        (feedback) => feedback.reading && feedback.translationKo && feedback.feedbackKo,
      ),
    ),
  ).toBe(true);
});

export type ChoiceFeedback = {
  reading: string;
  translationKo: string;
  feedbackKo: string;
};

export type Question = {
  id: string;
  type: "reading" | "context" | "synonym" | "usage" | "grammar";
  prompt: string;
  target?: string;
  choices: string[];
  answerIndex: number;
  explanationKo: string;
  choiceFeedback: ChoiceFeedback[];
  source:
    | { type: "textbook"; image: string; questionNumber: number | string }
    | { type: "generated"; basedOnWord: string; level: "N4" };
};

export function gradeChoice(question: Question, selectedIndex: number) {
  if (selectedIndex < 0 || selectedIndex >= question.choices.length) {
    throw new Error("선택지 인덱스가 올바르지 않습니다");
  }
  return { selectedIndex, correct: selectedIndex === question.answerIndex };
}

export function validateQuestions(questions: Question[]): Question[] {
  const types = new Set(["reading", "context", "synonym", "usage", "grammar"]);
  for (const question of questions) {
    if (!question.id?.trim() || !question.prompt?.trim() || !types.has(question.type)) {
      throw new Error("문제 기본 형식이 올바르지 않습니다");
    }
    if (question.choices.length !== question.choiceFeedback.length) {
      throw new Error(`${question.id}: 보기와 피드백 개수가 다릅니다`);
    }
    if (
      !Number.isInteger(question.answerIndex) ||
      question.answerIndex < 0 ||
      question.answerIndex >= question.choices.length
    ) {
      throw new Error(`${question.id}: 정답 인덱스가 올바르지 않습니다`);
    }
    if (
      question.choiceFeedback.some(
        (item) => typeof item.translationKo !== "string" || !item.translationKo.trim(),
      )
    ) {
      throw new Error(`${question.id}: 보기 해석이 비어 있습니다`);
    }
    if (
      question.choiceFeedback.some(
        (item) => !item.reading?.trim() || !item.feedbackKo?.trim(),
      )
    ) {
      throw new Error(`${question.id}: 보기 읽기 또는 설명이 비어 있습니다`);
    }
    if (question.type === "usage" && question.target && !question.prompt.includes(question.target)) {
      throw new Error(`${question.id}: 출제 대상이 질문에 표시되지 않았습니다`);
    }
    if (!question.source || !["textbook", "generated"].includes(question.source.type)) {
      throw new Error(`${question.id}: 출처 형식이 올바르지 않습니다`);
    }
  }
  return questions;
}

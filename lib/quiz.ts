export type ChoiceFeedback = {
  reading: string;
  translationKo: string;
  feedbackKo: string;
};

export type Question = {
  id: string;
  type: "reading" | "context" | "synonym" | "usage";
  prompt: string;
  target?: string;
  choices: string[];
  answerIndex: number;
  explanationKo: string;
  choiceFeedback: ChoiceFeedback[];
  source:
    | { type: "textbook"; image: string; questionNumber: number }
    | { type: "generated"; basedOnWord: string; level: "N4" };
};

export function gradeChoice(question: Question, selectedIndex: number) {
  if (selectedIndex < 0 || selectedIndex >= question.choices.length) {
    throw new Error("선택지 인덱스가 올바르지 않습니다");
  }
  return { selectedIndex, correct: selectedIndex === question.answerIndex };
}

export function validateQuestions(questions: Question[]): Question[] {
  for (const question of questions) {
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
  }
  return questions;
}

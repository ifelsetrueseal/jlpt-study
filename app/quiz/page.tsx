"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle } from "@phosphor-icons/react/dist/ssr";
import { QUESTIONS } from "@/data/questions";
import { gradeChoice } from "@/lib/quiz";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function QuizPage() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  if (questionIndex >= QUESTIONS.length) {
    return (
      <main className="pt-safe pb-safe px-safe flex min-h-dvh flex-col items-center justify-center gap-5 text-center">
        <p className="text-muted text-sm">문제 풀이 완료</p>
        <h1 className="text-4xl font-semibold tabular-nums">
          {score} / {QUESTIONS.length}
        </h1>
        <p className="text-sub">틀린 문제는 다시 풀면서 보기별 해설을 확인해 보세요.</p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            setQuestionIndex(0);
            setSelectedIndex(null);
            setScore(0);
          }}
        >
          다시 풀기
        </Button>
        <Link href="/" className="text-sub flex min-h-11 items-center px-4 text-sm">홈으로</Link>
      </main>
    );
  }

  const question = QUESTIONS[questionIndex];
  const answered = selectedIndex !== null;
  const result = answered ? gradeChoice(question, selectedIndex) : null;
  const sourceLabel = question.source.type === "textbook" ? "교재 기출" : "N4 응용";

  function selectChoice(index: number) {
    if (answered) return;
    setSelectedIndex(index);
    if (index === question.answerIndex) setScore((value) => value + 1);
  }

  function next() {
    setQuestionIndex((value) => value + 1);
    setSelectedIndex(null);
  }

  return (
    <main className="pt-safe pb-safe px-safe flex min-h-dvh flex-col gap-4">
      <header className="flex items-center gap-3">
        <Link href="/" aria-label="홈으로" className="text-sub -ml-3 flex h-11 w-11 items-center justify-center"><ArrowLeft size={22} /></Link>
        <div className="bg-elev h-1.5 flex-1 overflow-hidden rounded-full">
          <div className="bg-accent h-full" style={{ width: `${((questionIndex + 1) / QUESTIONS.length) * 100}%` }} />
        </div>
        <span className="text-muted text-sm tabular-nums">{questionIndex + 1}/{QUESTIONS.length}</span>
      </header>

      <div className="mt-3 flex items-center justify-between">
        <span className="bg-accent-weak text-accent rounded-full px-3 py-1 text-xs font-medium">{sourceLabel}</span>
        <span className="text-muted text-xs">현재 점수 {score}</span>
      </div>

      <Card className="p-5">
        <QuestionPrompt prompt={question.prompt} target={question.target} />
      </Card>

      <div className="flex flex-col gap-2">
        {question.choices.map((choice, index) => {
          const isAnswer = index === question.answerIndex;
          const isSelected = index === selectedIndex;
          return (
            <button
              key={`${question.id}-${choice}`}
              type="button"
              disabled={answered}
              onClick={() => selectChoice(index)}
              className={cn(
                "border-border bg-card rounded-control flex min-h-14 items-center gap-3 border px-4 py-3 text-left",
                answered && isAnswer && "border-success bg-success/10",
                answered && isSelected && !isAnswer && "border-danger bg-danger/10",
              )}
            >
              <span className="text-muted w-5 text-sm">{index + 1}</span>
              <span className="font-jp flex-1 leading-7">{choice}</span>
              {answered && isAnswer && <CheckCircle className="text-success" size={21} weight="fill" />}
              {answered && isSelected && !isAnswer && <XCircle className="text-danger" size={21} weight="fill" />}
            </button>
          );
        })}
      </div>

      {result && (
        <section aria-live="polite" className="flex flex-col gap-3">
          <Card className={cn("border p-4", result.correct ? "border-success/50" : "border-danger/50")}>
            <p className={cn("font-medium", result.correct ? "text-success" : "text-danger")}>
              {result.correct ? "정답이에요" : "아쉬워요"}
            </p>
            <p className="text-sub mt-2 text-sm leading-6">{question.explanationKo}</p>
          </Card>
          <div className="flex flex-col gap-2">
            {question.choiceFeedback.map((feedback, index) => (
              <Card key={`${question.id}-feedback-${index}`} className="p-4">
                <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                  <p className="font-jp min-w-0 break-words">{index + 1}. {feedback.reading}</p>
                  <span className="text-sub min-w-0 break-words text-sm">{feedback.translationKo}</span>
                </div>
                <p className="text-muted mt-2 text-xs leading-5">{feedback.feedbackKo}</p>
              </Card>
            ))}
          </div>
          <Button variant="primary" size="lg" onClick={next}>
            {questionIndex === QUESTIONS.length - 1 ? "결과 보기" : "다음 문제"}
          </Button>
        </section>
      )}
    </main>
  );
}

function QuestionPrompt({ prompt, target }: { prompt: string; target?: string }) {
  if (!target) return <p className="font-jp text-xl leading-9">{prompt}</p>;
  const start = prompt.indexOf(target);
  if (start < 0) return <p className="font-jp text-xl leading-9">{prompt}</p>;
  return (
    <p className="font-jp text-xl leading-9">
      {prompt.slice(0, start)}
      <span className="decoration-accent underline decoration-2 underline-offset-4">{target}</span>
      {prompt.slice(start + target.length)}
    </p>
  );
}

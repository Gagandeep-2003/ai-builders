"use client";

import { useMemo, useState, useTransition } from "react";
import {
  BrainCircuit,
  Check,
  CheckCircle2,
  Eye,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { submitModuleThreeQuiz } from "@/app/actions/quiz";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { QuizAttempt } from "@/lib/course-data";
import type {
  ModuleThreeQuizActivity,
  ModuleThreeQuizReview,
} from "@/lib/module-three-quizzes";
import { cn } from "@/lib/utils";

function optionOrder(questionIndex: number, sessionNumber: number) {
  const offset = (sessionNumber + questionIndex * 2 + 1) % 4;
  return Array.from({ length: 4 }, (_, index) => (index + offset) % 4);
}

function scoreLabel(score: number, total: number) {
  if (score === total) return "Perfect run";
  if (score >= total - 1) return "Nearly there";
  if (score >= Math.ceil(total / 2)) return "Good progress";
  return "Ready for another pass";
}

export function ModuleThreeQuizCard({ activity }: { activity: ModuleThreeQuizActivity }) {
  const quiz = activity.quiz;
  const [attempts, setAttempts] = useState<QuizAttempt[]>(activity.attempts);
  const [review, setReview] = useState<ModuleThreeQuizReview | undefined>(activity.review);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    Array(quiz?.questions.length ?? 0).fill(-1),
  );
  const [takingQuiz, setTakingQuiz] = useState(activity.attempts.length === 0);
  const [showAnswers, setShowAnswers] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const latestAttempt = attempts[0];
  const bestScore = useMemo(
    () => attempts.reduce((best, attempt) => Math.max(best, attempt.score), 0),
    [attempts],
  );
  const answeredCount = selectedAnswers.filter((answer) => answer >= 0).length;

  if (!activity.unlocked || !quiz) {
    return (
      <article className="premium-card overflow-hidden rounded-xl border border-border/80">
        <div className="flex items-start gap-4 p-6">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-white/[0.025] text-text-muted">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <div>
            <p className="font-mono text-xs uppercase text-text-muted">Knowledge check · Locked</p>
            <h3 className="mt-2 font-heading text-xl font-bold">Five-question session review</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Reach this session to reveal the concepts and questions. You can retry the check whenever you want after it unlocks.
            </p>
          </div>
        </div>
      </article>
    );
  }

  const resetForRetry = () => {
    setSelectedAnswers(Array(quiz.questions.length).fill(-1));
    setReview(undefined);
    setShowAnswers(false);
    setError("");
    setTakingQuiz(true);
  };

  const submit = () => {
    if (answeredCount !== quiz.questions.length) {
      setError("Choose one answer for every question before submitting.");
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await submitModuleThreeQuiz(quiz.id, selectedAnswers);
      if (!result.ok || !result.attempt || !result.review) {
        setError(result.error || "Your answers could not be saved. Please try again.");
        return;
      }
      setAttempts((current) => [result.attempt!, ...current]);
      setReview(result.review);
      setTakingQuiz(false);
      setShowAnswers(false);
    });
  };

  if (!takingQuiz && latestAttempt) {
    return (
      <article className="premium-card overflow-hidden rounded-xl border border-accent/25">
        <div className="relative p-6">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 bg-[radial-gradient(circle_at_top_right,rgba(110,231,183,0.14),transparent_68%)]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <div>
                <p className="font-mono text-xs uppercase text-accent">Knowledge check · Completed</p>
                <h3 className="mt-2 font-heading text-xl font-bold">{quiz.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {scoreLabel(latestAttempt.score, latestAttempt.totalQuestions)} · Latest score {latestAttempt.score}/{latestAttempt.totalQuestions}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowAnswers((current) => !current)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-white/[0.025] px-4 text-sm font-semibold text-text-primary transition hover:border-accent/35 hover:text-accent"
              >
                <Eye className="h-4 w-4" />
                {showAnswers ? "Hide answers" : "Show answers"}
              </button>
              <button
                type="button"
                onClick={resetForRetry}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-accent/35 bg-accent/10 px-4 text-sm font-semibold text-accent transition hover:bg-accent/15"
              >
                <RotateCcw className="h-4 w-4" />
                Try again
              </button>
            </div>
          </div>

          <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border/70 bg-black/10 p-4">
              <p className="font-mono text-[11px] uppercase text-text-muted">Best score</p>
              <p className="mt-2 font-heading text-2xl font-bold text-accent">{bestScore}/5</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-black/10 p-4">
              <p className="font-mono text-[11px] uppercase text-text-muted">Attempts</p>
              <p className="mt-2 font-heading text-2xl font-bold">{attempts.length}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-black/10 p-4">
              <p className="font-mono text-[11px] uppercase text-text-muted">Session</p>
              <p className="mt-2 font-heading text-2xl font-bold">{activity.sessionNumber}</p>
            </div>
          </div>

          {showAnswers && review ? (
            <div className="relative mt-5 space-y-3 border-t border-border pt-5">
              {quiz.questions.map((question, questionIndex) => {
                const result = review.questions[questionIndex];
                return (
                  <div key={question.id} className="rounded-lg border border-border/75 bg-white/[0.02] p-4">
                    <div className="flex items-start gap-3">
                      <span className={cn(
                        "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full",
                        result.isCorrect ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
                      )}>
                        {result.isCorrect ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      </span>
                      <div>
                        <p className="font-semibold text-text-primary">{question.prompt}</p>
                        <p className="mt-1 text-sm text-text-secondary">
                          Correct answer: <span className="font-medium text-accent">{question.options[result.correctIndex]}</span>
                        </p>
                        <p className="mt-1 text-sm leading-6 text-text-muted">{result.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article className="premium-card overflow-hidden rounded-xl border border-accent/25">
      <div className="border-b border-border/80 bg-accent/[0.045] p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
            <BrainCircuit className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-xs uppercase text-accent">Knowledge check</p>
              <span className="rounded-full border border-border bg-bg-card px-2.5 py-1 font-mono text-[10px] uppercase text-text-muted">
                5 questions
              </span>
            </div>
            <h3 className="mt-2 font-heading text-xl font-bold">{quiz.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">{quiz.description}</p>
          </div>
        </div>
        <ProgressBar
          className="mt-5"
          value={answeredCount}
          max={quiz.questions.length}
          label={`${answeredCount} of ${quiz.questions.length} answered`}
        />
      </div>

      <div className="space-y-4 p-6">
        {quiz.questions.map((question, questionIndex) => (
          <fieldset key={question.id} className="rounded-xl border border-border/80 bg-black/[0.06] p-5">
            <legend className="sr-only">Question {questionIndex + 1}</legend>
            <div className="flex items-start gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-accent/25 bg-accent/10 font-mono text-xs text-accent">
                {questionIndex + 1}
              </span>
              <p className="pt-0.5 font-heading font-semibold leading-6 text-text-primary">{question.prompt}</p>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {optionOrder(questionIndex, quiz.sessionNumber).map((optionIndex) => {
                const selected = selectedAnswers[questionIndex] === optionIndex;
                return (
                  <label
                    key={optionIndex}
                    className={cn(
                      "flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition",
                      selected
                        ? "border-accent/55 bg-accent/10 text-text-primary shadow-[0_0_18px_rgba(110,231,183,0.08)]"
                        : "border-border bg-white/[0.018] text-text-secondary hover:border-accent/25 hover:text-text-primary",
                    )}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={optionIndex}
                      checked={selected}
                      onChange={() => {
                        setSelectedAnswers((current) => {
                          const next = [...current];
                          next[questionIndex] = optionIndex;
                          return next;
                        });
                        setError("");
                      }}
                      className="sr-only"
                    />
                    <span className={cn(
                      "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                      selected ? "border-accent bg-accent text-black" : "border-border",
                    )}>
                      {selected ? <Check className="h-3 w-3" /> : null}
                    </span>
                    {question.options[optionIndex]}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div aria-live="polite">
            {error ? <p className="text-sm text-danger">{error}</p> : (
              <p className="flex items-center gap-2 text-sm text-text-muted">
                <Sparkles className="h-4 w-4 text-accent" />
                No timer and no penalty for retrying.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-accent px-5 font-semibold text-black transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60"
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {isPending ? "Checking answers..." : "Submit answers"}
          </button>
        </div>
      </div>
    </article>
  );
}

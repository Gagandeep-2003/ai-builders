"use server";

import { revalidatePath } from "next/cache";
import { getAuthIdentity } from "@/lib/auth";
import {
  getReachedSessionAccessBoundary,
  isSessionUnlocked,
} from "@/lib/content-access";
import type { QuizAttempt } from "@/lib/course-data";
import { getStudentContextData } from "@/lib/data";
import { reviewModuleThreeQuiz } from "@/lib/module-three-quiz-answers";
import {
  getModuleThreeQuizById,
  type ModuleThreeQuizReview,
} from "@/lib/module-three-quizzes";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type QuizSubmissionResult = {
  ok: boolean;
  error?: string;
  attempt?: QuizAttempt;
  review?: ModuleThreeQuizReview;
};

function quizTableUnavailable(error: { code?: string; message?: string } | null) {
  return Boolean(
    error &&
      (error.code === "42P01" ||
        error.code === "PGRST205" ||
        error.message?.toLowerCase().includes("quiz_attempts")),
  );
}

export async function submitModuleThreeQuiz(
  quizId: string,
  selectedAnswers: number[],
): Promise<QuizSubmissionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Knowledge checks are unavailable while the portal is offline." };
  }

  const quiz = getModuleThreeQuizById(quizId);
  if (!quiz) return { ok: false, error: "This knowledge check could not be found." };

  const validAnswers =
    selectedAnswers.length === quiz.questions.length &&
    selectedAnswers.every((answer) => Number.isInteger(answer) && answer >= 0 && answer < 4);
  if (!validAnswers) {
    return { ok: false, error: "Choose one answer for every question before submitting." };
  }

  const [supabase, identity, context] = await Promise.all([
    createServerSupabaseClient(),
    getAuthIdentity(),
    getStudentContextData(),
  ]);
  if (!supabase || !identity) return { ok: false, error: "Please sign in again to submit this quiz." };

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", identity.userId)
    .maybeSingle();
  if (!student) return { ok: false, error: "A student account is required for this quiz." };

  const session = context.sessions.find(
    (candidate) => candidate.globalNumber === quiz.sessionGlobalNumber,
  );
  const boundary = getReachedSessionAccessBoundary(context.sessions);
  if (!session || !isSessionUnlocked(session, boundary)) {
    return {
      ok: false,
      error: `This knowledge check unlocks when you reach Session ${quiz.sessionNumber}.`,
    };
  }

  const review = reviewModuleThreeQuiz(quizId, selectedAnswers);
  if (!review) return { ok: false, error: "This knowledge check could not be scored." };

  const completedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({
      student_id: student.id,
      quiz_id: quiz.id,
      session_id: session.id,
      selected_answers: selectedAnswers,
      score: review.score,
      total_questions: review.totalQuestions,
      completed_at: completedAt,
    })
    .select("id, student_id, quiz_id, session_id, selected_answers, score, total_questions, completed_at")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: quizTableUnavailable(error)
        ? "Knowledge checks need the latest Module 3 portal update before answers can be saved."
        : error?.message || "Your answers could not be saved. Please try again.",
    };
  }

  const attempt: QuizAttempt = {
    id: String(data.id),
    studentId: String(data.student_id),
    quizId: String(data.quiz_id),
    sessionId: String(data.session_id),
    selectedAnswers: Array.isArray(data.selected_answers)
      ? data.selected_answers.map(Number)
      : selectedAnswers,
    score: Number(data.score),
    totalQuestions: Number(data.total_questions),
    completedAt: String(data.completed_at),
  };

  revalidatePath("/homework");
  revalidatePath("/dashboard");
  revalidatePath("/progress");
  revalidatePath("/journey");
  revalidatePath("/admin/homework");
  revalidatePath("/admin/progress");

  return { ok: true, attempt, review };
}

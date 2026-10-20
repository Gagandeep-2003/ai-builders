import { HomeworkTracker } from "@/components/portal/homework-tracker";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import {
  getReachedSessionAccessBoundary,
  isSessionUnlocked,
} from "@/lib/content-access";
import { getStudentHomeworkData } from "@/lib/data";
import { reviewModuleThreeQuiz } from "@/lib/module-three-quiz-answers";
import {
  moduleThreeQuizzes,
  type ModuleThreeQuizActivity,
} from "@/lib/module-three-quizzes";

export default async function HomeworkPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session } = await searchParams;
  const data = await getStudentHomeworkData();
  const accessBoundary = getReachedSessionAccessBoundary(data.sessions);
  const quizActivities: ModuleThreeQuizActivity[] = moduleThreeQuizzes.flatMap((quiz) => {
    const quizSession = data.sessions.find(
      (candidate) => candidate.globalNumber === quiz.sessionGlobalNumber,
    );
    if (!quizSession) return [];

    const unlocked = isSessionUnlocked(quizSession, accessBoundary);
    const attempts = data.quizAttempts
      .filter((attempt) => attempt.quizId === quiz.id)
      .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
    const review = unlocked && attempts[0]
      ? reviewModuleThreeQuiz(quiz.id, attempts[0].selectedAnswers)
      : undefined;

    return [{
      sessionId: quizSession.id,
      sessionNumber: quiz.sessionNumber,
      unlocked,
      ...(unlocked ? { quiz } : {}),
      attempts,
      ...(review ? { review } : {}),
    }];
  });

  return (
    <AnimatedPage>
      <PageHeader
        title="Session Workbook"
        subtitle="Open each session to complete its class challenge, home task, and short knowledge check."
      />
      <HomeworkTracker
        homework={data.homework}
        sessions={data.sessions}
        quizActivities={quizActivities}
        initialSessionId={session}
      />
    </AnimatedPage>
  );
}

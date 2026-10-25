import { AnimatedPage } from "@/components/ui/animated";
import { PracticeLeague } from "@/components/portal/practice-league";
import { getStudentAchievementData, getStudentProgressData } from "@/lib/data";
import { buildPracticeLeague, calculateLeagueScore } from "@/lib/league";

export default async function LeaguePage() {
  const [data, achievements] = await Promise.all([getStudentProgressData(), getStudentAchievementData()]);
  const cumulativeSessions = data.curricula.flatMap((curriculum) => curriculum.sessions);
  const unlockedSessions = cumulativeSessions.filter(
    (session) => session.status === "completed" || session.status === "current",
  );
  const eligibleHomework = data.homework.filter(
    (item) => item.accessState !== "skipped" && item.accessState !== "not_enrolled",
  );
  const score = calculateLeagueScore({
    homework: data.homework,
    attendance: data.attendance,
    sessions: cumulativeSessions,
  });
  const entries = buildPracticeLeague({
    student: data.student,
    score,
    unlockedSessions: unlockedSessions.length,
    unlockedTasks: eligibleHomework.length,
  });

  return (
    <AnimatedPage>
      <PracticeLeague
        entries={entries}
        studentScore={score}
        unlockedTasks={eligibleHomework.length}
        earnedBadgeCount={achievements.awards.length}
      />
    </AnimatedPage>
  );
}

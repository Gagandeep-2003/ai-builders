import { AnimatedPage } from "@/components/ui/animated";
import { PracticeLeague } from "@/components/portal/practice-league";
import { getSessionAccessBoundary } from "@/lib/content-access";
import { getStudentAchievementData, getStudentProgressData } from "@/lib/data";
import { buildPracticeLeague, calculateLeagueScore } from "@/lib/league";

export default async function LeaguePage() {
  const [data, achievements] = await Promise.all([getStudentProgressData(), getStudentAchievementData()]);
  const access = getSessionAccessBoundary(data.sessions);
  const unlockedSessions = data.sessions.filter(
    (session) => session.globalNumber <= access.maxUnlockedGlobalNumber,
  );
  const score = calculateLeagueScore({
    homework: data.homework,
    attendance: data.attendance,
    sessions: data.sessions,
  });
  const entries = buildPracticeLeague({
    student: data.student,
    score,
    unlockedSessions: unlockedSessions.length,
    unlockedTasks: data.homework.length,
  });

  return (
    <AnimatedPage>
      <PracticeLeague
        entries={entries}
        studentScore={score}
        unlockedTasks={data.homework.length}
        earnedBadgeCount={achievements.awards.length}
      />
    </AnimatedPage>
  );
}

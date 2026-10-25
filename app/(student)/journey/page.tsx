import { JourneyExperience } from "@/components/portal/journey-experience";
import { AnimatedPage } from "@/components/ui/animated";
import { getNextSession } from "@/lib/time";
import { AchievementStrip } from "@/components/portal/achievement-strip";
import { CourseLevelSwitcher } from "@/components/portal/course-level-switcher";
import { calculateBadgeProgress } from "@/lib/achievements";
import { getStudentAchievementData, getStudentProgressData } from "@/lib/data";
import { courseLevelSwitcherItems, selectCourseCurriculum } from "@/lib/level-two";

export default async function JourneyPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level } = await searchParams;
  const [data, achievements] = await Promise.all([getStudentProgressData(), getStudentAchievementData()]);
  const curriculum = selectCourseCurriculum(data.curricula, level, data.activeCourseLevel);
  const completedCount = curriculum.sessions.filter((session) => session.status === "completed").length;
  const nextSession = getNextSession(curriculum.sessions);
  const cumulativeSessions = data.curricula.flatMap((item) => item.sessions);
  const badgeProgress = calculateBadgeProgress({
    definitions: achievements.definitions,
    awards: achievements.awards,
    homework: data.homework,
    attendance: data.attendance,
    sessions: cumulativeSessions,
  });

  return (
    <AnimatedPage>
      <CourseLevelSwitcher
        selectedLevel={curriculum.level}
        items={courseLevelSwitcherItems(data.curricula)}
        className="mb-6"
      />
      <JourneyExperience
        key={curriculum.level}
        student={data.student}
        modules={curriculum.modules}
        sessions={curriculum.sessions}
        completedCount={completedCount}
        nextSession={nextSession}
      />
      <div className="mt-6">
        <AchievementStrip
          awards={achievements.awards.filter((award) => award.definition.category === "curriculum")}
          progress={badgeProgress.filter((item) => item.definition.category === "curriculum")}
          title="Journey milestones"
        />
      </div>
    </AnimatedPage>
  );
}

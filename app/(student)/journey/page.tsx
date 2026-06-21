import { JourneyExperience } from "@/components/portal/journey-experience";
import { AnimatedPage } from "@/components/ui/animated";
import { getNextSession } from "@/lib/time";
import { AchievementStrip } from "@/components/portal/achievement-strip";
import { calculateBadgeProgress } from "@/lib/achievements";
import { getStudentAchievementData, getStudentProgressData } from "@/lib/data";

export default async function JourneyPage() {
  const [data, achievements] = await Promise.all([getStudentProgressData(), getStudentAchievementData()]);
  const completedCount = data.sessions.filter((session) => session.status === "completed").length;
  const nextSession = getNextSession(data.sessions);
  const badgeProgress = calculateBadgeProgress({
    definitions: achievements.definitions,
    awards: achievements.awards,
    homework: data.homework,
    attendance: data.attendance,
    sessions: data.sessions,
  });

  return (
    <AnimatedPage>
      <JourneyExperience
        student={data.student}
        modules={data.modules}
        sessions={data.sessions}
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

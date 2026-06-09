import { JourneyExperience } from "@/components/portal/journey-experience";
import { AnimatedPage } from "@/components/ui/animated";
import { getStudentDashboardData } from "@/lib/data";
import { getNextSession } from "@/lib/time";

export default async function JourneyPage() {
  const data = await getStudentDashboardData();
  const completedCount = data.sessions.filter((session) => session.status === "completed").length;
  const nextSession = getNextSession(data.sessions);

  return (
    <AnimatedPage>
      <JourneyExperience
        student={data.student}
        modules={data.modules}
        sessions={data.sessions}
        completedCount={completedCount}
        nextSession={nextSession}
      />
    </AnimatedPage>
  );
}

import { AttendanceDonut, HomeworkBarChart } from "@/components/ui/charts";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PrintButton } from "@/components/portal/print-button";
import { ProgressRing } from "@/components/portal/progress-ring";
import { AchievementGallery } from "@/components/portal/achievement-gallery";
import { CourseLevelSwitcher } from "@/components/portal/course-level-switcher";
import { calculateBadgeProgress } from "@/lib/achievements";
import { getStudentAchievementData, getStudentProgressData } from "@/lib/data";
import { formatDate, percent } from "@/lib/utils";
import { courseLevelSwitcherItems, selectCourseCurriculum } from "@/lib/level-two";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level } = await searchParams;
  const [data, achievements] = await Promise.all([getStudentProgressData(), getStudentAchievementData()]);
  const curriculum = selectCourseCurriculum(data.curricula, level, data.activeCourseLevel);
  const selectedSessionIds = new Set(curriculum.sessions.map((session) => session.id));
  const eligibleSessions = curriculum.sessions.filter(
    (session) => session.status !== "skipped" && session.status !== "not_enrolled",
  );
  const selectedHomework = data.homework.filter((item) => (item.courseLevel ?? 1) === curriculum.level);
  const selectedAttendance = data.attendance.filter((item) => selectedSessionIds.has(item.sessionId));
  const selectedFeedback = data.feedback.filter((item) => selectedSessionIds.has(item.sessionId));
  const cumulativeSessions = data.curricula.flatMap((item) => item.sessions);
  const badgeProgress = calculateBadgeProgress({
    definitions: achievements.definitions,
    awards: achievements.awards,
    homework: data.homework,
    attendance: data.attendance,
    sessions: cumulativeSessions,
  });
  const completed = eligibleSessions.filter((session) => session.status === "completed").length;
  const completion = percent(completed, eligibleSessions.length);
  const attendanceSummary = ["present", "absent", "rescheduled"].map((status) => ({
    name: status,
    value: selectedAttendance.filter((item) => item.status === status).length,
  }));
  const homeworkByModule = curriculum.modules.map((module) => {
    const items = selectedHomework.filter((item) => item.moduleId === module.id && item.accessState !== "skipped" && item.accessState !== "not_enrolled");
    return {
      module: `M${module.orderIndex}`,
      total: items.length,
      completed: items.filter((item) => item.status === "submitted" || item.status === "reviewed").length,
    };
  });

  return (
    <AnimatedPage className="print:text-black">
      <PageHeader
        title={`Level ${curriculum.level} Progress Report`}
        subtitle={`${completed} of ${eligibleSessions.length} enrolled sessions completed${curriculum.skippedSessionCount ? ` · ${curriculum.skippedSessionCount} skipped` : ""}. Level progress is measured separately.`}
        action={<PrintButton />}
      />

      <CourseLevelSwitcher
        selectedLevel={curriculum.level}
        items={courseLevelSwitcherItems(data.curricula)}
      />

      <div className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
        <section className="premium-card print-card rounded-xl p-6">
          <h2 className="font-heading text-2xl font-bold">Overall completion</h2>
          <div className="mt-8 flex justify-center">
            <ProgressRing value={completion} />
          </div>
        </section>
        <section className="premium-card print-card rounded-xl p-6">
          <h2 className="font-heading text-2xl font-bold">Module breakdown</h2>
          <div className="mt-6 space-y-5">
            {curriculum.modules.map((module) => {
              const moduleSessions = eligibleSessions.filter((session) => session.moduleId === module.id);
              const moduleCompleted = moduleSessions.filter((session) => session.status === "completed").length;
              return (
                <ProgressBar
                  key={module.id}
                  value={moduleCompleted}
                  max={Math.max(moduleSessions.length, 1)}
                  label={module.title}
                />
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="premium-card print-card rounded-xl p-6">
          <h2 className="font-heading text-2xl font-bold">Attendance summary</h2>
          <AttendanceDonut data={attendanceSummary} />
        </section>
        <section className="premium-card print-card rounded-xl p-6">
          <h2 className="font-heading text-2xl font-bold">Homework completion</h2>
          <HomeworkBarChart data={homeworkByModule} />
        </section>
      </div>

      <div id="achievements" className="scroll-mt-8">
        <AchievementGallery progress={badgeProgress} awards={achievements.awards} />
      </div>

      <section>
        <h2 className="font-heading text-2xl font-bold">Latest tutor feedback</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {selectedFeedback.map((feedback) => (
            <article key={feedback.id} className="premium-card print-card rounded-xl p-5">
              <p className="font-mono text-xs uppercase text-accent">{feedback.sessionName}</p>
              <p className="mt-3 leading-7 text-text-secondary">{feedback.tutorNote}</p>
              <p className="mt-4 font-mono text-xs text-text-muted">
                {formatDate(feedback.createdAt)}
              </p>
            </article>
          ))}
          {selectedFeedback.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-sm text-text-secondary">
              No tutor feedback has been added for Level {curriculum.level} yet.
            </p>
          ) : null}
        </div>
      </section>
    </AnimatedPage>
  );
}

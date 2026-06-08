import { AttendanceDonut, HomeworkBarChart } from "@/components/ui/charts";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PrintButton } from "@/components/portal/print-button";
import { ProgressRing } from "@/components/portal/progress-ring";
import { getStudentDashboardData } from "@/lib/data";
import { formatDate, percent } from "@/lib/utils";

export default async function ProgressPage() {
  const data = await getStudentDashboardData();
  const completed = data.sessions.filter((session) => session.status === "completed").length;
  const completion = percent(completed, data.sessions.length);
  const attendanceSummary = ["present", "absent", "rescheduled"].map((status) => ({
    name: status,
    value: data.attendance.filter((item) => item.status === status).length,
  }));
  const homeworkByModule = data.modules.map((module) => {
    const items = data.homework.filter((item) => item.moduleId === module.id);
    return {
      module: `M${module.orderIndex}`,
      total: items.length,
      completed: items.filter((item) => item.status !== "pending").length,
    };
  });

  return (
    <AnimatedPage className="print:text-black">
      <PageHeader
        title="Progress Report"
        subtitle="Completion, attendance, homework, and recent tutor feedback."
        action={<PrintButton />}
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
            {data.modules.map((module) => {
              const moduleSessions = data.sessions.filter((session) => session.moduleId === module.id);
              const moduleCompleted = moduleSessions.filter((session) => session.status === "completed").length;
              return (
                <ProgressBar
                  key={module.id}
                  value={moduleCompleted}
                  max={module.sessionCount}
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

      <section>
        <h2 className="font-heading text-2xl font-bold">Latest tutor feedback</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {data.feedback.map((feedback) => (
            <article key={feedback.id} className="premium-card print-card rounded-xl p-5">
              <p className="font-mono text-xs uppercase text-accent">{feedback.sessionName}</p>
              <p className="mt-3 leading-7 text-text-secondary">{feedback.tutorNote}</p>
              <p className="mt-4 font-mono text-xs text-text-muted">
                {formatDate(feedback.createdAt)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </AnimatedPage>
  );
}

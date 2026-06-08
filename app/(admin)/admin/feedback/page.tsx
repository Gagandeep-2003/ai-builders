import { saveFeedbackAction } from "@/app/actions/admin";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { getAdminData } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AdminFeedbackPage() {
  const data = await getAdminData();

  return (
    <AnimatedPage>
      <PageHeader title="Feedback" subtitle="Save session-specific tutor feedback for each student." />

      <section className="premium-card rounded-xl p-6">
        <h2 className="font-heading text-2xl font-bold">Add feedback</h2>
        <form action={saveFeedbackAction} className="mt-5 grid gap-4 md:grid-cols-2">
          <select name="studentId" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm">
            {data.students.map((student) => (
              <option key={student.id} value={student.id}>{student.fullName}</option>
            ))}
          </select>
          <select name="sessionId" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm">
            {data.sessions.map((session) => (
              <option key={session.id} value={session.id}>{session.title}</option>
            ))}
          </select>
          <textarea name="tutorNote" placeholder="Tutor note" className="min-h-32 rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm md:col-span-2" />
          <button className="button-motion rounded-xl bg-accent px-5 py-3 font-bold text-bg-base md:col-span-2">
            Save Feedback
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold">Past feedback</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {data.feedback.map((feedback) => (
            <article key={feedback.id} className="premium-card rounded-xl p-5">
              <p className="font-mono text-xs uppercase text-accent">{feedback.sessionName}</p>
              <p className="mt-3 leading-7 text-text-secondary">{feedback.tutorNote}</p>
              <p className="mt-4 font-mono text-xs text-text-muted">{formatDate(feedback.createdAt)}</p>
            </article>
          ))}
        </div>
      </section>
    </AnimatedPage>
  );
}

import { createHomeworkAction } from "@/app/actions/admin";
import { AdminHomeworkTaskManager } from "@/components/admin/admin-homework-task-manager";
import { AdminHomeworkWorkbook } from "@/components/admin/admin-homework-workbook";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { getAdminHomeworkData } from "@/lib/data";

export default async function AdminHomeworkPage() {
  const data = await getAdminHomeworkData();

  return (
    <AnimatedPage>
      <PageHeader
        title="Homework Manager"
        subtitle="Review each student session by session, with class challenges, home tasks, status, and completion time."
      />

      <AdminHomeworkWorkbook
        students={data.students}
        batches={data.batches}
        sessions={data.sessions}
        homework={data.homework}
      />

      <AdminHomeworkTaskManager
        students={data.students}
        batches={data.batches}
        sessions={data.sessions}
        homework={data.homework}
      />

      <details className="premium-card rounded-xl p-6">
        <summary className="cursor-pointer list-none">
          <div>
            <p className="font-mono text-xs uppercase text-accent">Admin tool</p>
            <h2 className="mt-2 font-heading text-2xl font-bold">Add class challenge or home task</h2>
            <p className="mt-2 text-sm text-text-secondary">
              For each module session, add two batch-level items: one Class Challenge Google Doc and one Home Task Google Doc.
              Students in that batch will see them automatically.
            </p>
          </div>
        </summary>
        <form action={createHomeworkAction} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-text-secondary md:col-span-2">
            <span className="font-mono text-xs uppercase text-text-muted">Target</span>
            <select name="target" className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary">
              <option value="all:">All students</option>
              {data.batches.map((batch) => (
                <option key={batch.id} value={`batch:${batch.id}`}>Batch: {batch.name}</option>
              ))}
              {data.students.map((student) => (
                <option key={student.id} value={`student:${student.id}`}>Student: {student.fullName}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-text-secondary md:col-span-2">
            <span className="font-mono text-xs uppercase text-text-muted">Module session</span>
            <select name="sessionId" className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary">
              {[1, 2, 3].map((moduleNumber) => (
                <optgroup key={moduleNumber} label={`Module ${moduleNumber}`}>
                  {data.sessions
                    .filter((session) => Math.ceil(session.globalNumber / 8) === moduleNumber)
                    .map((session) => (
                      <option key={session.id} value={session.id}>
                        Module {moduleNumber} · Session {session.sessionNumber}: {session.title}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-text-secondary">
            <span className="font-mono text-xs uppercase text-text-muted">Title</span>
            <input name="title" placeholder="M1 S1 Class Challenge" className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary" />
          </label>
          <label className="space-y-2 text-sm text-text-secondary">
            <span className="font-mono text-xs uppercase text-text-muted">Due date</span>
            <input name="dueDate" type="date" className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary" />
          </label>
          <label className="space-y-2 text-sm text-text-secondary">
            <span className="font-mono text-xs uppercase text-text-muted">Task type</span>
            <select name="kind" defaultValue="home_task" className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary">
              <option value="class_challenge">Class Challenge</option>
              <option value="home_task">Home Task</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-text-secondary">
            <span className="font-mono text-xs uppercase text-text-muted">Google Doc URL</span>
            <input name="contentUrl" placeholder="https://docs.google.com/document/d/..." className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary" />
          </label>
          <label className="space-y-2 text-sm text-text-secondary md:col-span-2">
            <span className="font-mono text-xs uppercase text-text-muted">Description</span>
            <textarea name="description" placeholder="Short instruction shown to students before they start the timer" className="min-h-28 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-text-primary" />
          </label>
          <button className="button-motion rounded-xl bg-accent px-5 py-3 font-bold text-bg-base md:col-span-2">
            Add Work Item
          </button>
        </form>
      </details>
    </AnimatedPage>
  );
}

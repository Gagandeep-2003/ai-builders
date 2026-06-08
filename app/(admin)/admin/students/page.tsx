import { createStudentAction, removeStudentAction, updateStudentAction } from "@/app/actions/admin";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { getAdminData } from "@/lib/data";
import { applySessionStatuses, commonTimeZones } from "@/lib/time";
import { formatDate } from "@/lib/utils";

export default async function AdminStudentsPage() {
  const data = await getAdminData();

  return (
    <AnimatedPage>
      <PageHeader
        title="Student Management"
        subtitle="Create student records after manually creating the matching Supabase auth user."
      />

      <section className="premium-card rounded-xl p-6">
        <h2 className="font-heading text-2xl font-bold">Add student</h2>
        <form action={createStudentAction} className="mt-5 grid gap-4 md:grid-cols-2">
          <input name="fullName" placeholder="Student full name" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
          <input name="email" type="email" placeholder="Student email" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
          <input name="userId" placeholder="Supabase auth user id" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
          <select name="batchId" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm">
            {data.batches.map((batch) => (
              <option key={batch.id} value={batch.id}>{batch.name}</option>
            ))}
          </select>
          <input name="parentName" placeholder="Parent name" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
          <input name="parentEmail" type="email" placeholder="Parent email" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
          <input name="country" placeholder="Country, e.g. United States" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
          <select name="timeZone" defaultValue="Asia/Kolkata" className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm">
            {commonTimeZones.map((timeZone) => (
              <option key={timeZone} value={timeZone}>{timeZone}</option>
            ))}
          </select>
          <button className="button-motion rounded-xl bg-accent px-5 py-3 font-bold text-bg-base md:col-span-2">
            Add Student Record
          </button>
        </form>
      </section>

      <section className="premium-card rounded-xl p-6">
        <div className="overflow-x-auto scrollbar-soft">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="font-mono text-xs uppercase text-text-muted">
              <tr className="border-b border-border/70">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Batch</th>
                <th className="py-3 pr-4">Module</th>
                <th className="py-3 pr-4">Timezone</th>
                <th className="py-3 pr-4">Sessions Done</th>
                <th className="py-3 pr-4">Homework</th>
                <th className="py-3 pr-4">Enrolled</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((student) => {
                const batch = data.batches.find((item) => item.id === student.batchId);
                const currentModule = data.modules.find((item) => item.id === batch?.moduleId);
                const pending = data.homework.filter(
                  (item) => item.status === "pending" && item.batchId === student.batchId,
                ).length;
                const completed = batch
                  ? applySessionStatuses(data.sessions, batch).filter((session) => {
                      const attended = data.attendance.some(
                        (item) =>
                          item.studentId === student.id &&
                          item.sessionId === session.id &&
                          item.status === "present",
                      );
                      return session.status === "completed" || attended;
                    }).length
                  : 0;
                return (
                  <tr key={student.id} className="border-b border-border/40">
                    <td className="py-4 pr-4 font-medium">{student.fullName}</td>
                    <td className="py-4 pr-4 text-text-secondary">{batch?.name ?? "Unassigned"}</td>
                    <td className="py-4 pr-4 text-text-secondary">{currentModule?.title ?? "Module 1"}</td>
                    <td className="py-4 pr-4 text-text-secondary">
                      {student.country ? `${student.country} · ` : ""}{student.timeZone}
                    </td>
                    <td className="py-4 pr-4 text-text-secondary">
                      {completed}/24
                    </td>
                    <td className="py-4 pr-4 text-text-secondary">{pending} pending</td>
                    <td className="py-4 pr-4 text-text-secondary">{formatDate(student.enrolledAt)}</td>
                    <td className="py-4 pr-4">
                      <div className="flex min-w-80 flex-wrap gap-2">
                        <form action={updateStudentAction} className="flex flex-wrap gap-2">
                          <input type="hidden" name="studentId" value={student.id} />
                          <input type="hidden" name="fullName" value={student.fullName} />
                          <input type="hidden" name="parentName" value={student.parentName} />
                          <input type="hidden" name="parentEmail" value={student.parentEmail} />
                          <input type="hidden" name="country" value={student.country} />
                          <select
                            name="batchId"
                            defaultValue={student.batchId}
                            className="rounded-xl border border-border bg-bg-elevated px-3 py-2"
                            aria-label={`Batch for ${student.fullName}`}
                          >
                            {data.batches.map((item) => (
                              <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                          </select>
                          <select
                            name="timeZone"
                            defaultValue={student.timeZone}
                            className="rounded-xl border border-border bg-bg-elevated px-3 py-2"
                            aria-label={`Timezone for ${student.fullName}`}
                          >
                            {commonTimeZones.map((timeZone) => (
                              <option key={timeZone} value={timeZone}>{timeZone}</option>
                            ))}
                          </select>
                          <button className="button-motion rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-accent">
                            Save
                          </button>
                        </form>
                        <form action={removeStudentAction}>
                          <input type="hidden" name="studentId" value={student.id} />
                          <button className="button-motion rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-rose-200">
                            Remove
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AnimatedPage>
  );
}

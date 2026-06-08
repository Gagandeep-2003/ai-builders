import { AttendanceStatusForm } from "@/components/admin/attendance-status-form";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAdminData } from "@/lib/data";
import { ADMIN_TIME_ZONE, formatSessionTime, getSessionScheduleDate } from "@/lib/time";

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams?: Promise<{ sessionId?: string }>;
}) {
  const data = await getAdminData();
  const params = await searchParams;
  const selectedSession =
    data.sessions.find((session) => session.id === params?.sessionId) ?? data.sessions[0];

  return (
    <AnimatedPage>
      <PageHeader title="Attendance" subtitle="Select a session and mark each student as present, absent, or rescheduled." />

      <section className="premium-card rounded-xl p-6">
        <h2 className="font-heading text-2xl font-bold">Session selector</h2>
        <form className="mt-5 flex flex-col gap-3 sm:flex-row" action="/admin/attendance">
          <select
            name="sessionId"
            defaultValue={selectedSession.id}
            className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
          >
            {data.sessions.map((session) => (
              <option key={session.id} value={session.id}>
                Session {session.globalNumber}: {session.title}
              </option>
            ))}
          </select>
          <button className="button-motion rounded-xl bg-accent px-5 py-3 font-bold text-bg-base">
            View
          </button>
        </form>
        <p className="mt-3 text-sm text-text-muted">
          Attendance dates are calculated per student batch and timezone.
        </p>
      </section>

      <section className="space-y-3">
        {data.students.map((student) => {
          const batch = data.batches.find((item) => item.id === student.batchId);
          const current = data.attendance.find(
            (item) => item.studentId === student.id && item.sessionId === selectedSession.id,
          )?.status ?? "present";
          const attendanceDate = batch
            ? getSessionScheduleDate(selectedSession, batch)
            : selectedSession.date;

          return (
            <article key={student.id} className="premium-card rounded-xl p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="font-heading text-lg font-bold">{student.fullName}</h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {selectedSession.title}
                    {batch ? ` · ${formatSessionTime(selectedSession, batch, student.timeZone)}` : ""}
                  </p>
                  {batch ? (
                    <p className="mt-1 font-mono text-xs text-text-muted">
                      Admin time: {formatSessionTime(selectedSession, batch, ADMIN_TIME_ZONE)}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={current} />
                  {["present", "absent", "rescheduled"].map((status) => (
                    <AttendanceStatusForm
                      key={status}
                      sessionId={selectedSession.id}
                      studentId={student.id}
                      status={status}
                      date={attendanceDate}
                    />
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </AnimatedPage>
  );
}

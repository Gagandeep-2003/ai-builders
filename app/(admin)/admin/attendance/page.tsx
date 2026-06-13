import { AttendanceStatusForm } from "@/components/admin/attendance-status-form";
import { reviewRescheduleRequestAction } from "@/app/actions/admin";
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
  const pendingReschedules = data.rescheduleRequests.filter((request) => request.status === "pending");
  const recentReschedules = data.rescheduleRequests.filter((request) => request.status !== "pending").slice(0, 6);

  return (
    <AnimatedPage>
      <PageHeader title="Attendance" subtitle="Select a session and mark each student as present, absent, or rescheduled." />

      <section className="premium-card rounded-xl p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase text-accent">Reschedule requests</p>
            <h2 className="mt-2 font-heading text-2xl font-bold">Student make-up class approvals</h2>
          </div>
          <p className="text-sm text-text-secondary">{pendingReschedules.length} pending</p>
        </div>

        <div className="mt-5 space-y-3">
          {pendingReschedules.length > 0 ? (
            pendingReschedules.map((request) => (
              <article key={request.id} className="rounded-xl border border-border/80 bg-white/[0.025] p-4">
                <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr] xl:items-start">
                  <div>
                    <h3 className="font-heading text-lg font-bold">{request.studentName}</h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      Requested {request.requestedDate} · {request.requestedStartTime.slice(0, 5)} - {request.requestedEndTime.slice(0, 5)} {request.requestedTimeZone}
                    </p>
                    {request.reason ? <p className="mt-2 text-sm text-text-muted">{request.reason}</p> : null}
                  </div>
                  <form action={reviewRescheduleRequestAction} className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
                    <input type="hidden" name="requestId" value={request.id} />
                    <input
                      name="meetLink"
                      placeholder="Meet link, blank reuses batch link"
                      className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
                    />
                    <input
                      name="adminNote"
                      placeholder="Admin note"
                      className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
                    />
                    <button
                      name="status"
                      value="approved"
                      className="button-motion rounded-xl bg-accent px-4 py-3 font-bold text-bg-base"
                    >
                      Approve
                    </button>
                    <button
                      name="status"
                      value="rejected"
                      className="button-motion rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 font-bold text-rose-100"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-xl border border-border/70 bg-white/[0.025] p-4 text-sm text-text-secondary">
              No pending reschedule requests.
            </p>
          )}
        </div>

        {recentReschedules.length > 0 ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {recentReschedules.map((request) => (
              <article key={request.id} className="rounded-xl border border-border/70 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-heading font-bold">{request.studentName}</p>
                  <StatusBadge status={request.status} />
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  {request.requestedDate} · {request.requestedStartTime.slice(0, 5)} {request.requestedTimeZone}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </section>

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

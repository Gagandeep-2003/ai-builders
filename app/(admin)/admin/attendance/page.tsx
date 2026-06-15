import { AttendanceStatusForm } from "@/components/admin/attendance-status-form";
import { createAdminRescheduleAction, reviewRescheduleRequestAction } from "@/app/actions/admin";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatRescheduleRequestTime } from "@/lib/class-events";
import { getAdminData } from "@/lib/data";
import { ADMIN_TIME_ZONE, commonTimeZones, formatSessionTime, getSessionScheduleDate } from "@/lib/time";

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
  const approvedReschedules = data.rescheduleRequests.filter((request) => request.status === "approved");
  const rejectedReschedules = data.rescheduleRequests.filter((request) => request.status === "rejected").slice(0, 4);
  const studentLookup = new Map(data.students.map((student) => [student.id, student]));

  return (
    <AnimatedPage>
      <PageHeader title="Attendance" subtitle="Select a session and mark each student as present, absent, or rescheduled." />

      <section className="premium-card rounded-xl p-6">
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr] xl:items-start">
          <div>
            <p className="font-mono text-xs uppercase text-accent">Admin scheduler</p>
            <h2 className="mt-2 font-heading text-2xl font-bold">Create a one-off class</h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Add a make-up or rescheduled class directly. It appears on the student dashboard, class page, and admin dashboard with a Make-up tag.
            </p>
          </div>
          <form action={createAdminRescheduleAction} className="grid gap-3 md:grid-cols-2">
            <select
              name="studentId"
              required
              className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
            >
              <option value="">Select student</option>
              {data.students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName}
                </option>
              ))}
            </select>
            <select
              name="requestedTimeZone"
              defaultValue={ADMIN_TIME_ZONE}
              className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
            >
              {commonTimeZones.map((timeZone) => (
                <option key={timeZone} value={timeZone}>
                  {timeZone}
                </option>
              ))}
            </select>
            <input
              name="requestedDate"
              type="date"
              required
              className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
            />
            <input
              name="originalDate"
              type="date"
              title="Original missed class date, optional"
              className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
            />
            <input
              name="requestedStartTime"
              type="time"
              required
              className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
            />
            <input
              name="requestedEndTime"
              type="time"
              required
              className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
            />
            <input
              name="meetLink"
              placeholder="Meet link, blank reuses batch link"
              className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm md:col-span-2"
            />
            <input
              name="reason"
              placeholder="Reason, for example: make-up class for missed Thursday"
              className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm md:col-span-2"
            />
            <textarea
              name="adminNote"
              placeholder="Student-visible note"
              className="min-h-20 rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm md:col-span-2"
            />
            <button className="button-motion rounded-xl bg-accent px-5 py-3 font-bold text-bg-base md:col-span-2">
              Add make-up class
            </button>
          </form>
        </div>
      </section>

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
                      Requested {formatRescheduleRequestTime(request, ADMIN_TIME_ZONE)}
                    </p>
                    <p className="mt-1 font-mono text-xs text-text-muted">
                      Student time: {formatRescheduleRequestTime(request, studentLookup.get(request.studentId)?.timeZone ?? request.requestedTimeZone)}
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

        {approvedReschedules.length > 0 ? (
          <div className="mt-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-xs uppercase text-accent">Approved make-up classes</p>
                <h3 className="mt-1 font-heading text-xl font-bold">Visible to students now</h3>
              </div>
              <p className="text-sm text-text-secondary">{approvedReschedules.length} approved</p>
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-2">
              {approvedReschedules.map((request) => (
                <article key={request.id} className="rounded-xl border border-accent/25 bg-accent/5 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-heading text-lg font-bold">{request.studentName}</p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {formatRescheduleRequestTime(request, ADMIN_TIME_ZONE)}
                      </p>
                      <p className="mt-1 font-mono text-xs text-text-muted">
                        Student time: {formatRescheduleRequestTime(request, studentLookup.get(request.studentId)?.timeZone ?? request.requestedTimeZone)}
                      </p>
                    </div>
                    <StatusBadge status="rescheduled" label="Make-up" />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border/70 bg-bg-card/70 p-3">
                      <p className="font-mono text-[11px] uppercase text-text-muted">Meet link</p>
                      {request.meetLink ? (
                        <a
                          href={request.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block truncate text-sm font-bold text-accent hover:text-text-primary"
                        >
                          {request.meetLink}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-text-secondary">Batch link will be used.</p>
                      )}
                    </div>
                    <div className="rounded-lg border border-border/70 bg-bg-card/70 p-3">
                      <p className="font-mono text-[11px] uppercase text-text-muted">Reviewed</p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {request.reviewedAt ? new Date(request.reviewedAt).toLocaleString() : "Just approved"}
                      </p>
                    </div>
                  </div>

                  {request.adminNote || request.reason ? (
                    <div className="mt-3 rounded-lg border border-border/70 bg-bg-card/70 p-3 text-sm text-text-secondary">
                      {request.adminNote ? <p><span className="text-text-primary">Admin note:</span> {request.adminNote}</p> : null}
                      {request.reason ? <p className={request.adminNote ? "mt-2" : ""}><span className="text-text-primary">Student reason:</span> {request.reason}</p> : null}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {rejectedReschedules.length > 0 ? (
          <details className="mt-5 rounded-xl border border-border/70 bg-white/[0.02] p-4">
            <summary className="cursor-pointer font-heading font-bold text-text-primary">
              Recently rejected requests
            </summary>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {rejectedReschedules.map((request) => (
                <article key={request.id} className="rounded-lg border border-border/70 bg-bg-card/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-heading font-bold">{request.studentName}</p>
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">
                    {formatRescheduleRequestTime(request, ADMIN_TIME_ZONE)}
                  </p>
                  {request.adminNote ? <p className="mt-2 text-sm text-text-muted">{request.adminNote}</p> : null}
                </article>
              ))}
            </div>
          </details>
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

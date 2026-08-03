import { AttendanceStatusForm } from "@/components/admin/attendance-status-form";
import {
  reviewRescheduleRequestAction,
  updateApprovedRescheduleMeetLinkAction,
  updateApprovedRescheduleOriginalAction,
} from "@/app/actions/admin";
import { DeleteApprovedClassButton } from "@/components/admin/delete-approved-class-button";
import { OneOffClassForm } from "@/components/admin/one-off-class-form";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatRescheduleRequestTime, getRescheduleRequestKind } from "@/lib/class-events";
import { getAdminData } from "@/lib/data";
import { ADMIN_TIME_ZONE, formatSessionTime, getSessionScheduleDate } from "@/lib/time";

function SchedulerField({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="block font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
        {label}
      </span>
      {children}
      {hint ? <span className="block text-xs leading-5 text-text-muted">{hint}</span> : null}
    </label>
  );
}
export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams?: Promise<{ sessionId?: string; reschedule?: string }>;
}) {
  const data = await getAdminData();
  const params = await searchParams;
  const selectedSession =
    data.sessions.find((session) => session.id === params?.sessionId) ?? data.sessions[0];
  const pendingReschedules = data.rescheduleRequests.filter((request) => request.status === "pending");
  const approvedReschedules = data.rescheduleRequests.filter((request) => request.status === "approved");
  const rejectedReschedules = data.rescheduleRequests.filter((request) => request.status === "rejected").slice(0, 4);
  const studentLookup = new Map(data.students.map((student) => [student.id, student]));
  const rescheduleNotice =
    params?.reschedule === "slot-taken"
      ? "That time is no longer free. Ask the student to choose another available slot."
      : params?.reschedule === "batch-paused"
        ? "That date falls inside this student's scheduled break. Choose a date after classes resume."
        : params?.reschedule === "invalid-original"
          ? "The original class date does not match this student's schedule."
        : params?.reschedule === "created"
          ? "Make-up class added. It is now visible in the student's My Class schedule."
        : params?.reschedule === "create-error"
          ? "The class could not be saved, so nothing was added to the student's schedule. Please try again."
        : params?.reschedule === "approved"
          ? "Class request approved. The student can now see the updated class in their portal."
        : params?.reschedule === "rejected"
          ? "Class request rejected. The student will see that the requested time is not scheduled and can choose another slot."
        : params?.reschedule === "deleted"
          ? "The approved one-off class was deleted and removed from the student's schedule."
        : params?.reschedule === "updated"
          ? "The approved class now replaces the selected regular occurrence."
        : params?.reschedule === "link-updated"
          ? "Meet link updated. The student can use it from My Class when joining opens."
        : params?.reschedule === "invalid-link"
          ? "Enter a valid Google Meet link before saving."
          : "";
  const rescheduleNoticeIsError = ["create-error", "invalid-link"].includes(params?.reschedule ?? "");

  return (
    <AnimatedPage>
      <PageHeader title="Attendance" subtitle="Select a session and mark each student as present, absent, or rescheduled." />
      {rescheduleNotice ? (
        <div
          className={`rounded-xl border p-4 text-sm ${
            rescheduleNoticeIsError
              ? "border-danger/35 bg-danger/10 text-danger"
              : "border-accent/30 bg-accent/10 text-accent"
          }`}
        >
          {rescheduleNotice}
        </div>
      ) : null}
      {pendingReschedules.length > 0 ? (
        <div className="rounded-2xl border border-accent-warm/35 bg-accent-warm/10 p-5 shadow-[0_0_35px_rgba(245,158,11,0.12)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase text-[color:var(--accent-warm)]">Approval queue</p>
              <h2 className="mt-2 font-heading text-xl font-bold">
                {pendingReschedules.length} student class request{pendingReschedules.length === 1 ? "" : "s"} need your decision
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Approve to place it on the student&apos;s schedule, or reject with a note so they know to pick another time.
              </p>
            </div>
            <a
              href="#reschedule-requests"
              className="button-motion inline-flex justify-center rounded-xl border border-accent-warm/35 bg-accent-warm/10 px-4 py-2 font-bold text-[color:var(--accent-warm)]"
            >
              Jump to requests
            </a>
          </div>
        </div>
      ) : null}

      <section className="premium-card rounded-xl p-6">
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr] xl:items-start">
          <div>
            <p className="font-mono text-xs uppercase text-accent">Admin scheduler</p>
            <h2 className="mt-2 font-heading text-2xl font-bold">Create a one-off class</h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Add an extra make-up class, or replace exactly one regular occurrence. Weekly classes after it continue normally.
            </p>
          </div>
          <OneOffClassForm
            students={data.students.map((student) => ({
              id: student.id,
              fullName: student.fullName,
              timeZone: student.timeZone,
            }))}
          />
        </div>
      </section>

      <section id="reschedule-requests" className="scroll-mt-6 premium-card rounded-xl p-6">
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
                    <StatusBadge
                      status="rescheduled"
                      label={getRescheduleRequestKind(request) === "rescheduled" ? "Move regular class" : "Additional make-up"}
                    />
                    <p className="mt-1 text-sm text-text-secondary">
                      Requested {formatRescheduleRequestTime(request, ADMIN_TIME_ZONE)}
                    </p>
                    <p className="mt-1 font-mono text-xs text-text-muted">
                      Student time: {formatRescheduleRequestTime(request, studentLookup.get(request.studentId)?.timeZone ?? request.requestedTimeZone)}
                    </p>
                    {request.reason ? <p className="mt-2 text-sm text-text-muted">{request.reason}</p> : null}
                  </div>
                  <form action={reviewRescheduleRequestAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto_auto] xl:items-end">
                    <input type="hidden" name="requestId" value={request.id} />
                    <SchedulerField
                      label="Original date · optional"
                      hint="Leave blank to keep this as an additional class."
                    >
                      <input
                        name="originalDate"
                        type="date"
                        defaultValue={request.originalDate ?? ""}
                        title="Fill only to replace one regular class"
                        className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
                      />
                    </SchedulerField>
                    <SchedulerField label="Meet link · optional" hint="Blank reuses the regular batch link.">
                      <input
                        name="meetLink"
                        type="url"
                        placeholder="https://meet.google.com/..."
                        className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
                      />
                    </SchedulerField>
                    <SchedulerField label="Student-visible admin note · optional">
                      <input
                        name="adminNote"
                        placeholder="Message shown to the student"
                        className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
                      />
                    </SchedulerField>
                    <SubmitButton
                      name="status"
                      value="approved"
                      pendingLabel="Approving..."
                      className="rounded-xl bg-accent px-4 py-3 font-bold text-bg-base"
                    >
                      Approve
                    </SubmitButton>
                    <SubmitButton
                      name="status"
                      value="rejected"
                      pendingLabel="Rejecting..."
                      className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 font-bold text-rose-100"
                    >
                      Reject
                    </SubmitButton>
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
                    <StatusBadge
                      status="rescheduled"
                      label={getRescheduleRequestKind(request) === "rescheduled" ? "Rescheduled" : "Make-up"}
                    />
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
                  <form action={updateApprovedRescheduleMeetLinkAction} className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input type="hidden" name="requestId" value={request.id} />
                    <input
                      name="meetLink"
                      type="url"
                      required
                      defaultValue={request.meetLink}
                      placeholder="https://meet.google.com/..."
                      aria-label={`Meet link for ${request.studentName}`}
                      className="min-w-0 flex-1 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm"
                    />
                    <SubmitButton
                      pendingLabel="Saving..."
                      className="button-motion rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm font-bold text-accent"
                    >
                      Save Meet link
                    </SubmitButton>
                  </form>
                  {!request.originalDate ? (
                    <form action={updateApprovedRescheduleOriginalAction} className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input type="hidden" name="requestId" value={request.id} />
                      <input
                        name="originalDate"
                        type="date"
                        required
                        aria-label="Original regular class date"
                        className="min-w-0 flex-1 rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm"
                      />
                      <button className="button-motion rounded-lg border border-info/30 bg-info/10 px-3 py-2 text-sm font-bold text-blue-100">
                        Make this a replacement
                      </button>
                    </form>
                  ) : (
                    <p className="mt-3 text-xs text-text-muted">
                      Replaces the regular class scheduled for {request.originalDate}.
                    </p>
                  )}
                  <div className="mt-3">
                    <DeleteApprovedClassButton requestId={request.id} studentName={request.studentName} />
                  </div>
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

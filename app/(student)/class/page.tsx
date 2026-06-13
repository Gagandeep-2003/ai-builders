import { CheckCircle2, CircleDot } from "lucide-react";
import { requestClassRescheduleAction } from "@/app/actions/class";
import { ClassLiveCard } from "@/components/portal/class-live-card";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStudentDashboardData } from "@/lib/data";
import { getStudentRescheduleOptions } from "@/lib/reschedule-options";
import { formatBatchSchedule, formatSessionTime, getActiveOrNextJoinSession } from "@/lib/time";
import { formatDate } from "@/lib/utils";

function formatRequestRange(date: string, startTime: string, endTime: string, timeZone: string) {
  return `${formatDate(date)} · ${startTime.slice(0, 5)} - ${endTime.slice(0, 5)} ${timeZone}`;
}

function rescheduleMessage(code?: string) {
  if (code === "requested") return "Your reschedule request was sent to admin for approval.";
  if (code === "pending") return "You already have a pending reschedule request.";
  if (code === "invalid") return "Please choose a valid reschedule slot.";
  if (code === "error") return "Could not send the request. Ask admin to run the reschedule migration.";
  return "";
}

export default async function ClassPage({
  searchParams,
}: {
  searchParams: Promise<{ join?: string; reschedule?: string }>;
}) {
  const { join, reschedule } = await searchParams;
  const data = await getStudentDashboardData();
  const nextSession = getActiveOrNextJoinSession(data.sessions, data.batch) ?? data.sessions[0];
  const requestMessage = rescheduleMessage(reschedule);
  const rescheduleOptions = getStudentRescheduleOptions(data.student.timeZone);
  const pendingRequest = data.rescheduleRequests.find((request) => request.status === "pending");
  const approvedRequests = data.rescheduleRequests.filter((request) => request.status === "approved");

  return (
    <AnimatedPage>
      <PageHeader
        title="My Class"
        subtitle="Your batch schedule, live class link, and upcoming session timeline."
      />
      {join === "attendance-error" ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-rose-200">
          We could not sync your attendance. Please try joining again or message your tutor.
        </div>
      ) : null}
      {join === "not-open" ? (
        <div className="rounded-xl border border-accent-warm/30 bg-accent-warm/10 p-4 text-sm text-amber-100">
          The class link opens 15 minutes before the scheduled start time.
        </div>
      ) : null}
      {requestMessage ? (
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm text-accent">
          {requestMessage}
        </div>
      ) : null}
      <ClassLiveCard batch={data.batch} nextSession={nextSession} viewerTimeZone={data.student.timeZone} />

      <section className="grid gap-4 md:grid-cols-2">
        <div className="premium-card rounded-xl p-5">
          <p className="font-mono text-xs uppercase text-text-muted">Your local time</p>
          <p className="mt-2 font-heading text-xl font-bold">
            {formatBatchSchedule(data.batch, data.student.timeZone)}
          </p>
          <p className="mt-2 text-sm text-text-secondary">{data.student.timeZone}</p>
        </div>
        <div className="premium-card rounded-xl p-5">
          <p className="font-mono text-xs uppercase text-text-muted">Bootcamp time</p>
          <p className="mt-2 font-heading text-xl font-bold">
            {formatBatchSchedule(data.batch, data.batch.timeZone)}
          </p>
          <p className="mt-2 text-sm text-text-secondary">{data.batch.timeZone}</p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
        <div className="premium-card rounded-xl p-5">
          <p className="font-mono text-xs uppercase text-accent">Reschedule request</p>
          <h2 className="mt-2 font-heading text-2xl font-bold">Ask for a make-up class</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Choose one preferred slot from the tutor availability list. Admin will approve it and attach the class link.
          </p>
          {pendingRequest ? (
            <div className="mt-5 rounded-xl border border-accent-warm/30 bg-accent-warm/10 p-4 text-sm text-amber-100">
              Pending request for {formatRequestRange(
                pendingRequest.requestedDate,
                pendingRequest.requestedStartTime,
                pendingRequest.requestedEndTime,
                pendingRequest.requestedTimeZone,
              )}
            </div>
          ) : (
            <form action={requestClassRescheduleAction} className="mt-5 space-y-3">
              <input type="hidden" name="originalDate" value="" />
              <select
                name="slot"
                required
                className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
              >
                {rescheduleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <textarea
                name="reason"
                placeholder="Short reason, for example: missed class / travel / school event"
                className="min-h-24 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
              />
              <button className="button-motion rounded-xl bg-accent px-5 py-3 font-bold text-bg-base">
                Send Request
              </button>
            </form>
          )}
        </div>

        <div className="premium-card rounded-xl p-5">
          <p className="font-mono text-xs uppercase text-accent">Approved make-up classes</p>
          <h2 className="mt-2 font-heading text-2xl font-bold">One-off schedule changes</h2>
          <div className="mt-5 space-y-3">
            {approvedRequests.length > 0 ? (
              approvedRequests.map((request) => (
                <article key={request.id} className="rounded-xl border border-border bg-white/[0.025] p-4">
                  <p className="font-heading font-bold">
                    {formatRequestRange(
                      request.requestedDate,
                      request.requestedStartTime,
                      request.requestedEndTime,
                      request.requestedTimeZone,
                    )}
                  </p>
                  {request.adminNote ? (
                    <p className="mt-2 text-sm text-text-secondary">{request.adminNote}</p>
                  ) : null}
                  {request.meetLink ? (
                    <a
                      href={request.meetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm font-bold text-accent"
                    >
                      Open make-up class link
                    </a>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="rounded-xl border border-border bg-white/[0.025] p-4 text-sm text-text-secondary">
                No approved make-up classes yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold">Session schedule</h2>
        <div className="mt-5 space-y-3">
          {data.sessions.map((session) => (
            <article
              key={session.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                {session.status === "completed" ? (
                  <CheckCircle2 className="mt-1 h-5 w-5 text-accent" />
                ) : (
                  <CircleDot className="mt-1 h-5 w-5 text-text-muted" />
                )}
                <div>
                  <p className="font-heading font-bold">{session.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Session {session.globalNumber} · {formatSessionTime(session, data.batch, data.student.timeZone)}
                  </p>
                  <p className="mt-1 font-mono text-xs text-text-muted">
                    Admin time: {formatSessionTime(session, data.batch, data.batch.timeZone)}
                  </p>
                </div>
              </div>
              <StatusBadge status={session.status} />
            </article>
          ))}
        </div>
      </section>
    </AnimatedPage>
  );
}

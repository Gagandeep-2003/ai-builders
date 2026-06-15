import { CalendarPlus, CheckCircle2, CircleDot } from "lucide-react";
import { requestClassRescheduleAction } from "@/app/actions/class";
import { ClassLiveCard } from "@/components/portal/class-live-card";
import { MakeupClassCard } from "@/components/portal/makeup-class-card";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  formatClassEventTime,
  formatRescheduleRequestTime,
  getNextClassEvent,
  getStudentClassEvents,
} from "@/lib/class-events";
import { getStudentDashboardData } from "@/lib/data";
import { getStudentRescheduleOptions } from "@/lib/reschedule-options";
import { ADMIN_TIME_ZONE, formatBatchSchedule, formatSessionTime, getActiveOrNextJoinSession } from "@/lib/time";

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
  const now = new Date();
  const classEvents = getStudentClassEvents({
    student: data.student,
    batch: data.batch,
    sessions: data.sessions,
    requests: data.rescheduleRequests,
    now,
  });
  const nextClassEvent = getNextClassEvent(classEvents, now);
  const nextSession = nextClassEvent?.kind === "regular" && nextClassEvent.session
    ? nextClassEvent.session
    : getActiveOrNextJoinSession(data.sessions, data.batch) ?? data.sessions[0];
  const requestMessage = rescheduleMessage(reschedule);
  const rescheduleOptions = getStudentRescheduleOptions(data.student.timeZone);
  const pendingRequest = data.rescheduleRequests.find((request) => request.status === "pending");
  const upcomingClassEvents = classEvents
    .filter((event) => event.endsAt.getTime() >= now.getTime())
    .slice(0, 10);

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

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        {nextClassEvent?.kind === "makeup" ? (
          <MakeupClassCard
            title={nextClassEvent.title}
            detail={nextClassEvent.detail}
            startsAtIso={nextClassEvent.startsAt.toISOString()}
            endsAtIso={nextClassEvent.endsAt.toISOString()}
            meetLink={nextClassEvent.meetLink}
            viewerTimeZone={data.student.timeZone}
          />
        ) : (
          <ClassLiveCard batch={data.batch} nextSession={nextSession} viewerTimeZone={data.student.timeZone} />
        )}

        <div className="premium-card rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <CalendarPlus className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-xs uppercase text-accent">Reschedule</p>
              <h2 className="mt-1 font-heading text-2xl font-bold">Request a make-up class</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Pick a tutor slot in your local time. Admin approval will add the final class link here.
              </p>
            </div>
          </div>

          {pendingRequest ? (
            <div className="mt-5 rounded-xl border border-accent-warm/30 bg-accent-warm/10 p-4 text-sm text-amber-100">
              Pending for {formatRescheduleRequestTime(pendingRequest, data.student.timeZone)}
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
                placeholder="Reason, for example: missed class / travel / school event"
                className="min-h-20 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
              />
              <button className="button-motion w-full rounded-xl bg-accent px-5 py-3 font-bold text-bg-base">
                Send Reschedule Request
              </button>
            </form>
          )}
        </div>
      </section>

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

      <section>
        <div className="premium-card rounded-xl p-5">
          <p className="font-mono text-xs uppercase text-accent">Class timeline</p>
          <h2 className="mt-2 font-heading text-2xl font-bold">Regular and make-up classes</h2>
          <p className="mt-2 text-sm text-text-secondary">
            One-off make-up classes appear here with a clear tag, beside your normal course schedule.
          </p>
          <div className="mt-5 space-y-3">
            {upcomingClassEvents.length > 0 ? (
              upcomingClassEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-xl border border-border bg-white/[0.025] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-heading font-bold">{event.title}</p>
                        <StatusBadge
                          status={event.kind === "makeup" ? "rescheduled" : event.status}
                          label={event.tag}
                        />
                      </div>
                      <p className="mt-2 text-sm text-text-secondary">
                        {formatClassEventTime(event, data.student.timeZone)}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">{event.detail}</p>
                      {event.kind === "makeup" ? (
                        <p className="mt-1 font-mono text-xs text-text-muted">
                          Tutor time: {formatClassEventTime(event, ADMIN_TIME_ZONE)}
                        </p>
                      ) : null}
                    </div>
                    {event.kind === "makeup" && event.meetLink ? (
                      <a
                        href={event.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="button-motion inline-flex rounded-lg border border-info/30 bg-info/10 px-3 py-2 text-sm font-bold text-blue-100"
                      >
                        Make-up link
                      </a>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-xl border border-border bg-white/[0.025] p-4 text-sm text-text-secondary">
                No upcoming classes found.
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
                    Admin time: {formatSessionTime(session, data.batch, ADMIN_TIME_ZONE)}
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

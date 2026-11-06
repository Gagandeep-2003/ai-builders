import { Suspense } from "react";
import { CheckCircle2, CircleDot } from "lucide-react";
import { ClassLiveCard } from "@/components/portal/class-live-card";
import { BatchPauseNotice } from "@/components/portal/batch-pause-notice";
import {
  ClassReschedulePanel,
  ClassReschedulePanelSkeleton,
} from "@/components/portal/class-reschedule-panel";
import { MakeupClassCard } from "@/components/portal/makeup-class-card";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  formatClassEventTime,
  getActiveRejectedClassRequest,
  getNextClassEvent,
  getStudentClassEvents,
} from "@/lib/class-events";
import { getStudentClassData } from "@/lib/data";
import {
  ADMIN_TIME_ZONE,
  formatBatchSchedule,
  formatSessionTime,
  getActiveOrNextJoinSession,
  getCurrentOrNextBatchClassOccurrence,
  getSessionDateTimes,
  getSessionScheduleDate,
} from "@/lib/time";

function rescheduleMessage(code?: string) {
  if (code === "requested") return "Your reschedule request was sent to admin for approval.";
  if (code === "pending") return "You already have a pending reschedule request.";
  if (code === "slot-taken") return "That tutor slot was just booked. Please choose another available time.";
  if (code === "invalid-original") return "Choose the regular class you want to move.";
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
  const data = await getStudentClassData();
  const now = new Date();
  const enrolledSessions = data.sessions.filter(
    (session) =>
      (session.courseLevel ?? 1) === data.activeCourseLevel &&
      session.status !== "skipped" &&
      session.status !== "not_enrolled",
  );
  const curriculumComplete = enrolledSessions.length > 0 && enrolledSessions.every(
    (session) => session.status === "completed",
  );
  const nextExtraOccurrence = curriculumComplete
    ? getCurrentOrNextBatchClassOccurrence(data.batch, now)
    : null;
  const finalSession = enrolledSessions.at(-1);
  const extraSession = nextExtraOccurrence && finalSession
    ? {
        ...finalSession,
        id: "extra-class",
        title: "Extra class",
        description: "An additional class after curriculum completion.",
        globalNumber: finalSession.globalNumber + 1,
        date: nextExtraOccurrence.date,
        scheduleIndex: 1,
        scheduleStartsAt: nextExtraOccurrence.startsAt.toISOString(),
        status: "current" as const,
      }
    : null;
  const classTimelineSessions = extraSession ? [...enrolledSessions, extraSession] : enrolledSessions;
  const classEvents = getStudentClassEvents({
    student: data.student,
    batch: data.batch,
    sessions: classTimelineSessions,
    requests: data.rescheduleRequests,
    now,
  });
  const nextClassEvent = getNextClassEvent(classEvents, now);
  const nextSession = nextClassEvent?.kind === "regular" && nextClassEvent.session
    ? nextClassEvent.session
    : getActiveOrNextJoinSession(classTimelineSessions, data.batch) ?? classTimelineSessions[0];
  const requestMessage = rescheduleMessage(reschedule);
  const pendingRequest = data.rescheduleRequests.find((request) => request.status === "pending");
  const latestRejectedRequest = getActiveRejectedClassRequest(data.rescheduleRequests, classEvents, now);
  const originalClassOptions = enrolledSessions
    .filter(
      (session) =>
        session.status !== "skipped" &&
        session.status !== "not_enrolled" &&
        getSessionDateTimes(session, data.batch).endsAt.getTime() >= now.getTime(),
    )
    .map((session) => ({
      value: getSessionScheduleDate(session, data.batch),
      label: `Level ${session.courseLevel ?? 1} · Module ${session.moduleNumber ?? Math.ceil(session.globalNumber / 8)} · Session ${session.sessionNumber}: ${session.title} · ${formatSessionTime(session, data.batch, data.student.timeZone)}`,
    }));
  const upcomingClassEvents = classEvents
    .filter((event) => event.endsAt.getTime() >= now.getTime())
    .slice(0, 10);

  return (
    <AnimatedPage>
      <PageHeader
        title="My Class"
        subtitle={`Level ${data.activeCourseLevel} · Your weekly schedule, live class link, and upcoming session timeline.`}
      />
      <BatchPauseNotice batch={data.batch} />
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
      {join === "rescheduled" ? (
        <div className="rounded-xl border border-info/30 bg-info/10 p-4 text-sm text-blue-100">
          This regular class was moved. Use the rescheduled class shown in your timeline instead.
        </div>
      ) : null}
      {requestMessage ? (
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm text-accent">
          {requestMessage}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        {nextClassEvent && nextClassEvent.kind !== "regular" ? (
          <MakeupClassCard
            label={nextClassEvent.tag}
            title={nextClassEvent.title}
            detail={nextClassEvent.detail}
            startsAtIso={nextClassEvent.startsAt.toISOString()}
            endsAtIso={nextClassEvent.endsAt.toISOString()}
            requestId={nextClassEvent.request?.id ?? ""}
            viewerTimeZone={data.student.timeZone}
          />
        ) : (
          <ClassLiveCard
            batch={data.batch}
            nextSession={nextSession}
            viewerTimeZone={data.student.timeZone}
            isExtraClass={nextSession.id === "extra-class"}
          />
        )}

        <Suspense fallback={<ClassReschedulePanelSkeleton />}>
          <ClassReschedulePanel
            studentTimeZone={data.student.timeZone}
            batch={data.batch}
            pendingRequest={pendingRequest}
            latestRejectedRequest={latestRejectedRequest}
            originalClassOptions={originalClassOptions}
          />
        </Suspense>
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
          <p className="font-mono text-xs uppercase text-text-muted">Course time</p>
          <p className="mt-2 font-heading text-xl font-bold">
            {formatBatchSchedule(data.batch, data.batch.timeZone)}
          </p>
          <p className="mt-2 text-sm text-text-secondary">{data.batch.timeZone}</p>
        </div>
      </section>

      <section>
        <div className="premium-card rounded-xl p-5">
          <p className="font-mono text-xs uppercase text-accent">Class timeline</p>
          <h2 className="mt-2 font-heading text-2xl font-bold">Regular, rescheduled, and make-up classes</h2>
          <p className="mt-2 text-sm text-text-secondary">
            A rescheduled class replaces one original occurrence. A make-up class is an additional session.
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
                          status={event.kind !== "regular" ? "rescheduled" : event.status}
                          label={event.tag}
                        />
                      </div>
                      <p className="mt-2 text-sm text-text-secondary">
                        {formatClassEventTime(event, data.student.timeZone)}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">{event.detail}</p>
                      {event.kind !== "regular" ? (
                        <p className="mt-1 font-mono text-xs text-text-muted">
                          Tutor time: {formatClassEventTime(event, ADMIN_TIME_ZONE)}
                        </p>
                      ) : null}
                    </div>
                    {event.kind !== "regular" && event.meetLink ? (
                      <a
                        href={event.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="button-motion inline-flex rounded-lg border border-info/30 bg-info/10 px-3 py-2 text-sm font-bold text-blue-100"
                      >
                        {event.tag} link
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
          {data.sessions.map((session) => {
            const sessionDate = getSessionScheduleDate(session, data.batch);
            const replacement = classEvents.find(
              (event) =>
                event.kind === "rescheduled" &&
                event.request?.originalDate === sessionDate,
            );
            return (
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
                    Session {session.globalNumber} · {replacement
                      ? formatClassEventTime(replacement, data.student.timeZone)
                      : formatSessionTime(session, data.batch, data.student.timeZone)}
                  </p>
                  <p className="mt-1 font-mono text-xs text-text-muted">
                    Admin time: {replacement
                      ? formatClassEventTime(replacement, ADMIN_TIME_ZONE)
                      : formatSessionTime(session, data.batch, ADMIN_TIME_ZONE)}
                  </p>
                  {replacement ? (
                    <p className="mt-1 text-xs text-info">
                      Rescheduled from {sessionDate}; the original occurrence is cancelled.
                    </p>
                  ) : null}
                </div>
              </div>
              <StatusBadge
                status={replacement ? "rescheduled" : session.status}
                label={replacement ? "Rescheduled" : undefined}
              />
            </article>
          )})}
        </div>
      </section>
    </AnimatedPage>
  );
}

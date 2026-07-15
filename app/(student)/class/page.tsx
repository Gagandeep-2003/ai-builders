import { CalendarPlus, CheckCircle2, CircleDot, Clock3, XCircle } from "lucide-react";
import { requestClassRescheduleAction } from "@/app/actions/class";
import { ClassLiveCard } from "@/components/portal/class-live-card";
import { BatchPauseNotice } from "@/components/portal/batch-pause-notice";
import { MakeupClassCard } from "@/components/portal/makeup-class-card";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  formatClassEventTime,
  formatRescheduleRequestTime,
  getNextClassEvent,
  getRescheduleRequestKind,
  getStudentClassEvents,
} from "@/lib/class-events";
import { getAdminAvailabilityData, getMentorScheduleData, getStudentClassData } from "@/lib/data";
import { getStudentRescheduleOptions } from "@/lib/reschedule-options";
import { getBookedSlots } from "@/lib/slot-availability";
import {
  ADMIN_TIME_ZONE,
  formatBatchSchedule,
  formatSessionTime,
  getActiveOrNextJoinSession,
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
  const [mentorSchedule, availability] = await Promise.all([
    getMentorScheduleData(),
    getAdminAvailabilityData(),
  ]);
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
  const rescheduleOptions = getStudentRescheduleOptions(data.student.timeZone, {
    bookedSlots: getBookedSlots(mentorSchedule.batches, mentorSchedule.students),
    requests: mentorSchedule.rescheduleRequests,
    excludedPauses: data.batch.pauses,
    excludedPauseTimeZone: data.batch.timeZone,
    availabilityBucket: availability.bucket,
  });
  const pendingRequest = data.rescheduleRequests.find((request) => request.status === "pending");
  const latestRejectedRequest = data.rescheduleRequests
    .filter((request) => request.status === "rejected")
    .sort((a, b) => {
      const aTime = new Date(a.reviewedAt || a.requestedAt || a.requestedDate).getTime();
      const bTime = new Date(b.reviewedAt || b.requestedAt || b.requestedDate).getTime();
      return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
    })[0];
  const originalClassOptions = data.sessions
    .filter((session) => getSessionDateTimes(session, data.batch).endsAt.getTime() >= now.getTime())
    .map((session) => ({
      value: getSessionScheduleDate(session, data.batch),
      label: `Session ${session.globalNumber}: ${session.title} · ${formatSessionTime(session, data.batch, data.student.timeZone)}`,
    }));
  const upcomingClassEvents = classEvents
    .filter((event) => event.endsAt.getTime() >= now.getTime())
    .slice(0, 10);

  return (
    <AnimatedPage>
      <PageHeader
        title="My Class"
        subtitle="Your batch schedule, live class link, and upcoming session timeline."
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
              <h2 className="mt-1 font-heading text-2xl font-bold">Move or add a class</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Move one regular class to another day, or request an additional make-up class.
                Only tutor times that are still free are shown.
              </p>
            </div>
          </div>

          {pendingRequest ? (
            <div className="mt-5 rounded-2xl border border-accent-warm/35 bg-accent-warm/10 p-4 shadow-[0_0_30px_rgba(245,158,11,0.12)]">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-accent-warm/30 bg-accent-warm/10 text-[color:var(--accent-warm)]">
                  <Clock3 className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-xs uppercase text-[color:var(--accent-warm)]">
                      Waiting for mentor approval
                    </p>
                    <StatusBadge
                      status="pending"
                      label={getRescheduleRequestKind(pendingRequest) === "rescheduled" ? "Move request" : "Make-up request"}
                    />
                  </div>
                  <h3 className="mt-2 font-heading text-lg font-bold text-text-primary">
                    Request sent for {formatRescheduleRequestTime(pendingRequest, data.student.timeZone)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    Your request is not active yet. Keep following your current class schedule until your mentor approves it.
                    If this was for a missed class, your mentor can approve another time or adjust the class later.
                  </p>
                  {pendingRequest.reason ? (
                    <p className="mt-3 rounded-xl border border-border/70 bg-bg-card/70 p-3 text-sm text-text-muted">
                      Your note: {pendingRequest.reason}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <>
              {latestRejectedRequest ? (
                <div className="mt-5 rounded-2xl border border-danger/35 bg-danger/10 p-4 shadow-[0_0_30px_rgba(251,113,133,0.1)]">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-danger/30 bg-danger/10 text-[color:var(--danger)]">
                      <XCircle className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-xs uppercase text-[color:var(--danger)]">
                          Last request not approved
                        </p>
                        <StatusBadge status="rejected" />
                      </div>
                      <h3 className="mt-2 font-heading text-lg font-bold text-text-primary">
                        {formatRescheduleRequestTime(latestRejectedRequest, data.student.timeZone)} is not scheduled
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-text-secondary">
                        That requested time was not added to your class timeline. Choose another free slot below,
                        or your mentor can adjust the missed class later or near the end of the course.
                      </p>
                      {latestRejectedRequest.adminNote ? (
                        <p className="mt-3 rounded-xl border border-border/70 bg-bg-card/70 p-3 text-sm text-text-muted">
                          Mentor note: {latestRejectedRequest.adminNote}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
              <form action={requestClassRescheduleAction} className="mt-5 space-y-3">
              <fieldset className="grid gap-2 sm:grid-cols-2">
                <label className="cursor-pointer rounded-xl border border-accent/30 bg-accent/5 p-3">
                  <input type="radio" name="requestType" value="reschedule" defaultChecked className="mr-2" />
                  <span className="font-bold">Move a class</span>
                  <span className="mt-1 block text-xs text-text-muted">
                    After approval, the original occurrence disappears and this time replaces it.
                  </span>
                </label>
                <label className="cursor-pointer rounded-xl border border-border bg-bg-elevated p-3">
                  <input type="radio" name="requestType" value="makeup" className="mr-2" />
                  <span className="font-bold">Add a make-up</span>
                  <span className="mt-1 block text-xs text-text-muted">
                    Adds one extra class without changing your normal schedule.
                  </span>
                </label>
              </fieldset>
              <label className="block">
                <span className="mb-2 block font-mono text-xs uppercase text-text-muted">
                  Regular class to move
                </span>
                <select
                  name="originalDate"
                  className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
                >
                  <option value="">Not needed for an additional make-up</option>
                  {originalClassOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block font-mono text-xs uppercase text-text-muted">
                  New class time
                </span>
                <select
                  name="slot"
                  required
                  className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
                >
                  <option value="">Choose a free tutor time</option>
                  {rescheduleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <textarea
                name="reason"
                placeholder="Reason, for example: missed class / travel / school event"
                className="min-h-20 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
              />
              <button className="button-motion w-full rounded-xl bg-accent px-5 py-3 font-bold text-bg-base">
                Send Class Request
              </button>
              </form>
            </>
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

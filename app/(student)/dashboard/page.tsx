import {
  FolderOpen,
  Video,
  BookOpenCheck,
  Clock3,
  XCircle,
} from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";
import { AnimatedPage, FadeIn, Stagger } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { BatchPauseNotice } from "@/components/portal/batch-pause-notice";
import { ChatDashboardBanner } from "@/components/chat/chat-dashboard-banner";
import {
  DashboardSecondary,
  DashboardSecondarySkeleton,
} from "@/components/portal/dashboard-secondary";
import { ExtraSessionsNotice } from "@/components/portal/extra-sessions-notice";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  daysUntilClassEvent,
  getActiveRejectedClassRequest,
  formatClassEventTime,
  formatRescheduleRequestTime,
  getNextClassEvent,
  getRescheduleRequestKind,
  getStudentClassEvents,
} from "@/lib/class-events";
import { getStudentDashboardCoreData } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { formatSessionTime, getNextSession } from "@/lib/time";

function getGreeting(now: Date, timeZone: string) {
  let hour = now.getHours();
  try {
    hour = Number(
      new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone }).format(now),
    ) % 24;
  } catch {
    // Fall back to server-local hour if the stored timezone is invalid.
  }
  if (hour < 5) return "Up late building";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const data = await getStudentDashboardCoreData();
  const now = new Date();
  const showExtraSessionsNotice = data.student.email.trim().toLowerCase() === "yug.sharma@student.com";
  const completed = data.sessions.filter((session) => session.status === "completed").length;
  const cumulativeSessions = data.curricula.flatMap((curriculum) => curriculum.sessions);
  const classEvents = getStudentClassEvents({
    student: data.student,
    batch: data.batch,
    sessions: cumulativeSessions,
    requests: data.rescheduleRequests,
    now,
  });
  const nextClassEvent = getNextClassEvent(classEvents, now);
  const nextSession = nextClassEvent?.session ?? getNextSession(data.sessions) ?? data.sessions[0];
  const currentModule = data.modules.find((module) => module.id === nextSession.moduleId) ?? data.modules[0];
  const moduleCompleted = data.sessions.filter(
    (session) => session.moduleId === currentModule.id && session.status === "completed",
  ).length;
  const pendingClassRequest = data.rescheduleRequests.find((request) => request.status === "pending");
  const latestRejectedClassRequest = getActiveRejectedClassRequest(data.rescheduleRequests, classEvents, now);

  return (
    <AnimatedPage>
      <PageHeader
        title={`${getGreeting(now, data.student.timeZone)}, ${data.student.fullName.split(" ")[0]} 👋`}
        subtitle={`Today is ${formatDate(new Date(), { weekday: "long" })}. Your next class is ${nextClassEvent?.kind === "makeup" ? "a make-up class" : nextClassEvent?.kind === "rescheduled" ? "a rescheduled class" : nextSession.title} at ${nextClassEvent ? formatClassEventTime(nextClassEvent, data.student.timeZone) : formatSessionTime(nextSession, data.batch, data.student.timeZone)}.`}
      />

      {showExtraSessionsNotice ? <ExtraSessionsNotice studentId={data.student.id} /> : null}

      <BatchPauseNotice batch={data.batch} />
      <ChatDashboardBanner />
      {pendingClassRequest ? (
        <Link
          href="/class"
          className="group block rounded-2xl border border-accent-warm/35 bg-accent-warm/10 p-4 shadow-[0_0_30px_rgba(245,158,11,0.1)] transition hover:border-accent-warm/60"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-accent-warm/30 bg-accent-warm/10 text-[color:var(--accent-warm)]">
              <Clock3 className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-xs uppercase text-[color:var(--accent-warm)]">Class request pending</p>
                <StatusBadge
                  status="pending"
                  label={getRescheduleRequestKind(pendingClassRequest) === "rescheduled" ? "Move request" : "Make-up request"}
                />
              </div>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Requested {formatRescheduleRequestTime(pendingClassRequest, data.student.timeZone)}. Your current schedule stays the same until your mentor approves it.
              </p>
            </div>
          </div>
        </Link>
      ) : latestRejectedClassRequest ? (
        <Link
          href="/class"
          className="group block rounded-2xl border border-danger/35 bg-danger/10 p-4 shadow-[0_0_30px_rgba(251,113,133,0.08)] transition hover:border-danger/60"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-danger/30 bg-danger/10 text-[color:var(--danger)]">
              <XCircle className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-xs uppercase text-[color:var(--danger)]">Class request not approved</p>
                <StatusBadge status="rejected" />
              </div>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {formatRescheduleRequestTime(latestRejectedClassRequest, data.student.timeZone)} is not scheduled. Open My Class to choose another slot.
              </p>
            </div>
          </div>
        </Link>
      ) : null}

      <Stagger className="grid gap-4 sm:grid-cols-2">
        <FadeIn>
          <StatCard icon="book" label={`Level ${data.activeCourseLevel} Sessions Completed`} value={completed} />
        </FadeIn>
        <FadeIn>
          <StatCard
            icon="calendar"
            label="Days to Next Class"
            value={nextClassEvent ? Math.max(daysUntilClassEvent(nextClassEvent), 0) : 0}
          />
        </FadeIn>
      </Stagger>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="premium-card rounded-xl p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase text-accent">Level {data.activeCourseLevel} · Current Module</p>
              <h2 className="mt-3 font-heading text-2xl font-bold">{currentModule.title}</h2>
              <p className="mt-3 max-w-2xl text-text-secondary">{currentModule.description}</p>
            </div>
            <div className="rounded-xl border border-border bg-bg-elevated px-4 py-3 font-mono text-sm text-accent">
              {moduleCompleted}/8 sessions
            </div>
          </div>
          <ProgressBar
            className="mt-8"
            value={moduleCompleted}
            max={8}
            label="Module progress"
          />
          <div className="mt-6 rounded-xl border border-border/70 bg-white/[0.025] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-xs uppercase text-text-muted">Next class</p>
              {nextClassEvent?.kind !== "regular" ? (
                <span className="rounded-full border border-info/30 bg-info/10 px-2.5 py-1 font-mono text-[11px] uppercase text-blue-100">
                  {nextClassEvent?.tag} class
                </span>
              ) : null}
            </div>
            <h3 className="mt-2 font-heading text-xl font-bold">
              {nextClassEvent?.kind !== "regular" ? nextClassEvent?.title : nextSession.title}
            </h3>
            <p className="mt-2 text-text-secondary">
              {nextClassEvent?.kind !== "regular" ? nextClassEvent?.detail : nextSession.focus}
            </p>
            <p className="mt-3 font-mono text-xs text-accent">
              {nextClassEvent
                ? formatClassEventTime(nextClassEvent, data.student.timeZone)
                : formatSessionTime(nextSession, data.batch, data.student.timeZone)}
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          {[
            ["Join Class", "/class", Video],
            ["View Curriculum", `/curriculum?level=${data.activeCourseLevel}`, BookOpenCheck],
            ["My Resources", `/resources?level=${data.activeCourseLevel}`, FolderOpen],
          ].map(([label, href, Icon]) => (
            <Link
              key={String(label)}
              href={String(href)}
              className="premium-card premium-card-hover flex items-center gap-4 rounded-xl p-5"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-heading font-bold">{String(label)}</span>
            </Link>
          ))}
        </section>
      </div>

      <Suspense fallback={<DashboardSecondarySkeleton />}>
        <DashboardSecondary />
      </Suspense>
    </AnimatedPage>
  );
}

import {
  FolderOpen,
  Gift,
  Trophy,
  Video,
  BookOpenCheck,
} from "lucide-react";
import Link from "next/link";
import { AnimatedPage, FadeIn, Stagger } from "@/components/ui/animated";
import { AnnouncementCard } from "@/components/ui/announcement-card";
import { HomeworkCard } from "@/components/ui/homework-card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AchievementStrip } from "@/components/portal/achievement-strip";
import { BatchPauseNotice } from "@/components/portal/batch-pause-notice";
import { StatCard } from "@/components/ui/stat-card";
import {
  daysUntilClassEvent,
  formatClassEventTime,
  getNextClassEvent,
  getStudentClassEvents,
} from "@/lib/class-events";
import { getStudentAchievementData, getStudentDashboardData } from "@/lib/data";
import { calculateBadgeProgress } from "@/lib/achievements";
import { calculateLeagueScore } from "@/lib/league";
import { formatDate } from "@/lib/utils";
import { formatSessionTime, getNextSession } from "@/lib/time";

export default async function DashboardPage() {
  const [data, achievements] = await Promise.all([getStudentDashboardData(), getStudentAchievementData()]);
  const now = new Date();
  const completed = data.sessions.filter((session) => session.status === "completed").length;
  const pendingHomework = data.homework.filter(
    (item) => item.status === "pending" || item.status === "revision_requested",
  );
  const classEvents = getStudentClassEvents({
    student: data.student,
    batch: data.batch,
    sessions: data.sessions,
    requests: data.rescheduleRequests,
    now,
  });
  const nextClassEvent = getNextClassEvent(classEvents, now);
  const nextSession = nextClassEvent?.session ?? getNextSession(data.sessions) ?? data.sessions[0];
  const currentModule = data.modules.find((module) => module.id === nextSession.moduleId) ?? data.modules[0];
  const moduleCompleted = data.sessions.filter(
    (session) => session.moduleId === currentModule.id && session.status === "completed",
  ).length;
  const leagueScore = calculateLeagueScore({
    homework: data.homework,
    attendance: data.attendance,
    sessions: data.sessions,
  });
  const badgeProgress = calculateBadgeProgress({
    definitions: achievements.definitions,
    awards: achievements.awards,
    homework: data.homework,
    attendance: data.attendance,
    sessions: data.sessions,
  });

  return (
    <AnimatedPage>
      <PageHeader
        title={`Welcome back, ${data.student.fullName.split(" ")[0]} 👋`}
        subtitle={`Today is ${formatDate(new Date(), { weekday: "long" })}. Your next class is ${nextClassEvent?.kind === "makeup" ? "a make-up class" : nextClassEvent?.kind === "rescheduled" ? "a rescheduled class" : nextSession.title} at ${nextClassEvent ? formatClassEventTime(nextClassEvent, data.student.timeZone) : formatSessionTime(nextSession, data.batch, data.student.timeZone)}.`}
      />

      <BatchPauseNotice batch={data.batch} />

      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FadeIn>
          <StatCard icon="book" label="Sessions Completed" value={completed} />
        </FadeIn>
        <FadeIn>
          <StatCard icon="clipboard" label="Homework Pending" value={pendingHomework.length} />
        </FadeIn>
        <FadeIn>
          <StatCard icon="folder" label="Resources Available" value={data.resources.length} />
        </FadeIn>
        <FadeIn>
          <StatCard
            icon="calendar"
            label="Days to Next Class"
            value={nextClassEvent ? Math.max(daysUntilClassEvent(nextClassEvent), 0) : 0}
          />
        </FadeIn>
      </Stagger>

      <AchievementStrip awards={achievements.awards} progress={badgeProgress} title="Latest achievements" />

      <section className="grid gap-4 lg:grid-cols-2">
        <Link
          href="/league"
          className="group relative overflow-hidden rounded-xl border border-accent/25 bg-bg-card p-6 transition hover:-translate-y-0.5 hover:border-accent/50"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,rgba(110,231,183,0.17),transparent_40%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase text-accent">AI Builders League</p>
              <h2 className="mt-2 font-heading text-2xl font-bold">{leagueScore.points} momentum points</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {leagueScore.currentStreak
                  ? `${leagueScore.currentStreak}-class streak active. See what moves you up next.`
                  : "Start your class streak and begin moving through the AI Builders League."}
              </p>
            </div>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent transition group-hover:scale-105">
              <Trophy className="h-5 w-5" />
            </span>
          </div>
        </Link>
        <Link
          href="/referrals"
          className="group relative overflow-hidden rounded-xl border border-amber-300/20 bg-bg-card p-6 transition hover:-translate-y-0.5 hover:border-amber-300/40"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,rgba(251,191,36,0.13),transparent_40%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase text-amber-200">Learn together reward</p>
              <h2 className="mt-2 font-heading text-2xl font-bold">4 bonus sessions for you</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Refer a friend, sibling, or cousin. After enrolment and their first session, they also get 2 welcome boosters.
              </p>
            </div>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-amber-300/25 bg-amber-300/10 text-amber-200 transition group-hover:scale-105">
              <Gift className="h-5 w-5" />
            </span>
          </div>
        </Link>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="premium-card rounded-xl p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase text-accent">Current Module</p>
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
            ["View Curriculum", "/curriculum", BookOpenCheck],
            ["My Resources", "/resources", FolderOpen],
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

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase text-accent">Homework</p>
            <h2 className="mt-2 font-heading text-2xl font-bold">Upcoming work</h2>
          </div>
          <Link href="/homework" className="text-sm text-accent">
            View all
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {data.homework.slice(0, 3).map((homework) => (
            <HomeworkCard key={homework.id} homework={homework} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="font-mono text-xs uppercase text-accent">Announcements</p>
          <h2 className="mt-2 font-heading text-2xl font-bold">Latest updates</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {data.announcements.slice(0, 3).map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      </section>
    </AnimatedPage>
  );
}

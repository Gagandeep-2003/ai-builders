import Link from "next/link";
import { Gift, Trophy } from "lucide-react";
import { AchievementStrip } from "@/components/portal/achievement-strip";
import { FadeIn, Stagger } from "@/components/ui/animated";
import { AnnouncementCard } from "@/components/ui/announcement-card";
import { HomeworkCard } from "@/components/ui/homework-card";
import { StatCard } from "@/components/ui/stat-card";
import { calculateBadgeProgress } from "@/lib/achievements";
import { getStudentAchievementData, getStudentDashboardData } from "@/lib/data";
import { calculateLeagueScore } from "@/lib/league";

export async function DashboardSecondary() {
  const [data, achievements] = await Promise.all([
    getStudentDashboardData(),
    getStudentAchievementData(),
  ]);
  const pendingHomework = data.homework.filter(
    (item) =>
      (item.courseLevel ?? 1) === data.activeCourseLevel &&
      item.accessState === "available" &&
      (item.status === "pending" || item.status === "revision_requested"),
  );
  const activeHomework = data.homework.filter(
    (item) => (item.courseLevel ?? 1) === data.activeCourseLevel && item.accessState === "available",
  );
  const cumulativeSessions = data.curricula.flatMap((curriculum) => curriculum.sessions);
  const leagueScore = calculateLeagueScore({
    homework: data.homework,
    attendance: data.attendance,
    sessions: cumulativeSessions,
  });
  const badgeProgress = calculateBadgeProgress({
    definitions: achievements.definitions,
    awards: achievements.awards,
    homework: data.homework,
    attendance: data.attendance,
    sessions: cumulativeSessions,
  });

  return (
    <>
      <Stagger className="grid gap-4 sm:grid-cols-2">
        <FadeIn>
          <StatCard icon="clipboard" label="Homework Pending" value={pendingHomework.length} />
        </FadeIn>
        <FadeIn>
          <StatCard icon="folder" label="Resources Available" value={data.resources.length} />
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

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase text-accent">Homework</p>
            <h2 className="mt-2 font-heading text-2xl font-bold">Upcoming work</h2>
          </div>
          <Link href={`/homework?level=${data.activeCourseLevel}`} className="text-sm text-accent">View all</Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {activeHomework.slice(0, 3).map((homework) => (
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
    </>
  );
}

export function DashboardSecondarySkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading dashboard updates">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-32 animate-pulse rounded-xl border border-border bg-white/[0.025]" />
        <div className="h-32 animate-pulse rounded-xl border border-border bg-white/[0.025]" />
      </div>
      <div className="h-40 animate-pulse rounded-xl border border-border bg-white/[0.025]" />
    </div>
  );
}

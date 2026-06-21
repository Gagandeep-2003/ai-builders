"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpenCheck,
  CheckCircle2,
  Flame,
  Globe2,
  Medal,
  Sparkles,
  Target,
  Trophy,
  UsersRound,
} from "lucide-react";
import type { LeagueEntry, LeagueScore } from "@/lib/league";
import { cn } from "@/lib/utils";

type LeagueMetric = "overall" | "homework" | "attendance" | "streak";

const metricLabels: Record<LeagueMetric, string> = {
  overall: "Overall",
  homework: "Homework",
  attendance: "Attendance",
  streak: "Class streak",
};

function metricValue(entry: LeagueEntry, metric: LeagueMetric) {
  if (metric === "homework") return entry.submittedTasks * 60 + entry.reviewedTasks * 20;
  if (metric === "attendance") return entry.attendanceRate;
  if (metric === "streak") return entry.currentStreak;
  return entry.points;
}

function metricSuffix(metric: LeagueMetric) {
  if (metric === "attendance") return "%";
  if (metric === "streak") return " classes";
  return " pts";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PracticeLeague({
  entries,
  studentScore,
  unlockedTasks,
}: {
  entries: LeagueEntry[];
  studentScore: LeagueScore;
  unlockedTasks: number;
}) {
  const [metric, setMetric] = useState<LeagueMetric>("overall");
  const [country, setCountry] = useState("All");
  const [paceTick, setPaceTick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setPaceTick((value) => value + 1), 18000);
    return () => window.clearInterval(timer);
  }, []);
  const liveMetricValue = (entry: LeagueEntry) => {
    const base = metricValue(entry, metric);
    if (entry.isStudent || metric === "attendance") return base;
    const seed = Number(entry.id.replace(/\D/g, "")) || 1;
    const pulse = ((seed * 7 + paceTick * 5) % 5) - 2;
    if (metric === "streak") return Math.max(0, base + (pulse > 1 ? 1 : 0));
    return Math.max(0, base + pulse * (metric === "overall" ? 9 : 4));
  };
  const countries = useMemo(
    () => ["All", ...Array.from(new Set(entries.map((entry) => entry.country))).sort()],
    [entries],
  );
  const ranked = useMemo(
    () =>
      entries
        .filter((entry) => country === "All" || entry.country === country || entry.isStudent)
        .sort((a, b) => liveMetricValue(b) - liveMetricValue(a) || a.name.localeCompare(b.name)),
    // liveMetricValue intentionally changes with the practice pace tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [country, entries, metric, paceTick],
  );
  const studentRank = ranked.findIndex((entry) => entry.isStudent) + 1;
  const nextRival = studentRank > 1 ? ranked[studentRank - 2] : undefined;
  const pointsToNext = nextRival
    ? Math.max(liveMetricValue(nextRival) - liveMetricValue(ranked[studentRank - 1]) + 1, 0)
    : 0;
  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const homeworkCompletion = unlockedTasks
    ? Math.round((studentScore.submittedTasks / unlockedTasks) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-accent/25 bg-bg-card p-6 shadow-[0_30px_90px_rgba(110,231,183,0.08)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(110,231,183,0.16),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(96,165,250,0.13),transparent_30%)]" />
        <motion.div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-accent/15"
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        />
        <div className="relative grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent">
              <UsersRound className="h-3.5 w-3.5" />
              Privacy-safe Practice League
            </div>
            <h1 className="mt-5 font-heading text-4xl font-extrabold sm:text-5xl">
              Your momentum has a scoreboard.
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-text-secondary">
              Your score uses your real portal activity. Every other name is a simulated benchmark profile,
              built to create fair competition without exposing another student&apos;s identity or performance.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-bg-elevated/70 p-4">
              <p className="font-mono text-[0.65rem] uppercase text-text-muted">Your rank</p>
              <p className="mt-2 font-heading text-3xl font-bold text-accent">#{studentRank}</p>
              <p className="mt-1 text-xs text-text-secondary">of {ranked.length} profiles</p>
            </div>
            <div className="rounded-xl border border-border bg-bg-elevated/70 p-4">
              <p className="font-mono text-[0.65rem] uppercase text-text-muted">Your points</p>
              <p className="mt-2 font-heading text-3xl font-bold">{studentScore.points}</p>
              <p className="mt-1 text-xs text-text-secondary">
                {pointsToNext ? `${pointsToNext} to move up` : "League leader"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="premium-card rounded-xl p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <Target className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-bold">How points are earned</h2>
              <p className="text-sm text-text-secondary">Only genuine learning actions move your score.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["Submit a task", "+60", BookOpenCheck],
              ["Tutor-reviewed task", "+20 bonus", CheckCircle2],
              ["Attend a class", "+40", Trophy],
              ["Complete a session", "+25", Sparkles],
              ["Each active streak class", "+15", Flame],
            ].map(([label, value, Icon]) => (
              <div key={String(label)} className="flex items-center gap-3 rounded-xl border border-border/70 bg-white/[0.025] p-3">
                <Icon className="h-4 w-4 text-accent" />
                <span className="min-w-0 flex-1 text-sm text-text-secondary">{String(label)}</span>
                <span className="font-mono text-xs font-bold text-accent">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card rounded-xl p-5">
          <p className="font-mono text-xs uppercase text-accent">Your next boost</p>
          <h2 className="mt-2 font-heading text-2xl font-bold">
            {homeworkCompletion < 100 ? "Finish the unlocked workbook" : "Protect your class streak"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            {homeworkCompletion < 100
              ? `${studentScore.submittedTasks}/${unlockedTasks} unlocked tasks submitted. One submission adds 60 points immediately.`
              : `${studentScore.currentStreak} classes in your current streak. Attend the next class to add another 55 combined points.`}
          </p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),#60a5fa)]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(4, homeworkCompletion)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </section>

      <section className="premium-card overflow-hidden rounded-xl">
        <div className="border-b border-border/70 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="font-mono text-xs uppercase text-accent">Live practice pace · refreshes every 18 seconds</p>
              <h2 className="mt-2 font-heading text-2xl font-bold">Compete at your current course stage</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex rounded-xl border border-border bg-bg-elevated p-1">
                {(Object.keys(metricLabels) as LeagueMetric[]).map((item) => (
                  <button
                    key={item}
                    onClick={() => setMetric(item)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-xs font-bold transition",
                      metric === item ? "bg-accent text-bg-base" : "text-text-secondary hover:text-text-primary",
                    )}
                  >
                    {metricLabels[item]}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 rounded-xl border border-border bg-bg-elevated px-3">
                <Globe2 className="h-4 w-4 text-text-muted" />
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="h-10 bg-transparent text-sm text-text-secondary outline-none"
                >
                  {countries.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-b border-border/70 bg-white/[0.015] p-5 md:grid-cols-3">
          {podium.map((entry, index) => (
            <motion.article
              key={`${metric}-${country}-${entry.id}`}
              className={cn(
                "relative overflow-hidden rounded-xl border p-4",
                entry.isStudent
                  ? "border-accent/50 bg-accent/10"
                  : index === 0
                    ? "border-amber-300/35 bg-amber-300/[0.06]"
                    : "border-border bg-bg-card",
              )}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, type: "spring", stiffness: 260, damping: 22 }}
            >
              <Medal className={cn("absolute right-3 top-3 h-5 w-5", index === 0 ? "text-amber-300" : "text-text-muted")} />
              <p className="font-mono text-xs uppercase text-text-muted">Rank {index + 1}</p>
              <div className="mt-4 flex items-center gap-3">
                <span className={cn("grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br font-heading font-bold text-white", entry.avatarTone)}>
                  {initials(entry.name)}
                </span>
                <div>
                  <h3 className="font-heading font-bold">{entry.isStudent ? `${entry.name} · You` : entry.name}</h3>
                  <p className="text-xs text-text-secondary">{entry.country}</p>
                </div>
              </div>
              <p className="mt-5 font-heading text-3xl font-bold">
                {liveMetricValue(entry)}<span className="ml-1 text-sm text-text-muted">{metricSuffix(metric)}</span>
              </p>
            </motion.article>
          ))}
        </div>

        <div className="divide-y divide-border/60">
          <AnimatePresence mode="popLayout">
            {rest.map((entry, index) => (
              <motion.div
                layout
                key={`${metric}-${country}-${entry.id}`}
                className={cn(
                  "grid items-center gap-3 px-5 py-3 sm:grid-cols-[3rem_1fr_auto_auto]",
                  entry.isStudent && "bg-accent/10 shadow-[inset_3px_0_0_var(--accent)]",
                )}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ delay: Math.min(index * 0.018, 0.22) }}
              >
                <span className="font-mono text-sm text-text-muted">#{index + 4}</span>
                <div className="flex min-w-0 items-center gap-3">
                  <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-xs font-bold text-white", entry.avatarTone)}>
                    {initials(entry.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-heading font-bold">
                      {entry.isStudent ? `${entry.name} · You` : entry.name}
                    </p>
                    <p className="text-xs text-text-muted">{entry.country} · Session stage {entry.stage}</p>
                  </div>
                </div>
                <div className="hidden items-center gap-3 text-xs text-text-secondary sm:flex">
                  <span>{entry.submittedTasks} tasks</span>
                  <span className="inline-flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-300" />{entry.currentStreak}</span>
                </div>
                <span className="font-mono text-sm font-bold text-accent">
                  {liveMetricValue(entry)}{metricSuffix(metric)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

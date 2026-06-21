"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Flame,
  Globe2,
  Medal,
  Radio,
  Sparkles,
  Target,
  Trophy,
  UsersRound,
} from "lucide-react";
import type { LeagueEntry, LeagueScore } from "@/lib/league";
import { cn } from "@/lib/utils";

const LeagueFluidCursor = dynamic(() => import("@/components/portal/league-fluid-cursor"), {
  ssr: false,
});

type LeagueMetric = "overall" | "homework" | "attendance" | "streak";

const metricLabels: Record<LeagueMetric, string> = {
  overall: "Overall",
  homework: "Homework",
  attendance: "Attendance",
  streak: "Class streak",
};

const countryCodes: Record<string, string> = {
  "United States": "USA",
  Canada: "CAN",
  "United Kingdom": "UK",
  UAE: "UAE",
};

const podiumOrder = [1, 0, 2];

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
    // The live practice field intentionally changes with each pace tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [country, entries, metric, paceTick],
  );
  const studentRank = ranked.findIndex((entry) => entry.isStudent) + 1;
  const studentEntry = ranked.find((entry) => entry.isStudent);
  const nextRival = studentRank > 1 ? ranked[studentRank - 2] : undefined;
  const pointsToNext = nextRival && studentEntry
    ? Math.max(liveMetricValue(nextRival) - liveMetricValue(studentEntry) + 1, 0)
    : 0;
  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const maxValue = Math.max(...ranked.map(liveMetricValue), 1);
  const homeworkCompletion = unlockedTasks
    ? Math.round((studentScore.submittedTasks / unlockedTasks) * 100)
    : 0;

  return (
    <main className="league-fluid-cursor-zone relative isolate -mx-2 overflow-hidden sm:-mx-4 lg:-mx-6">
      <LeagueFluidCursor />

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_8%_15%,rgba(255,138,52,0.12),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(110,231,183,0.16),transparent_32%),radial-gradient(circle_at_55%_38%,rgba(91,140,255,0.12),transparent_30%)]" />
        <div className="league-arena-grid absolute inset-0 opacity-35" />
      </div>

      <header className="relative min-h-[34rem] overflow-hidden border-y border-border/70 px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <motion.div
          className="absolute right-[8%] top-12 h-72 w-72 rounded-full border border-accent/15"
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute right-[12%] top-20 h-56 w-56 rounded-full border border-blue-400/15"
          animate={{ rotate: -360 }}
          transition={{ duration: 19, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative grid min-h-[27rem] gap-10 lg:grid-cols-[1fr_0.82fr] lg:items-center">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 font-mono text-[0.68rem] uppercase text-accent">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
              </span>
              Live practice league
            </div>
            <h1 className="mt-5 max-w-2xl font-heading text-5xl font-extrabold leading-[0.96] sm:text-6xl lg:text-7xl">
              Learn.
              <span className="block bg-[linear-gradient(90deg,#ff9c52,#6ee7b7_52%,#75a7ff)] bg-clip-text text-transparent">
                Move the field.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
              Your position is powered by real learning activity. The surrounding field uses simulated,
              privacy-safe benchmark profiles so progress feels competitive without exposing another student.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <div>
                <p className="font-mono text-[0.62rem] uppercase text-text-muted">Current position</p>
                <p className="mt-1 font-heading text-4xl font-black text-accent">#{studentRank}</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <p className="font-mono text-[0.62rem] uppercase text-text-muted">Momentum</p>
                <p className="mt-1 font-heading text-4xl font-black">{studentScore.points}</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <p className="font-mono text-[0.62rem] uppercase text-text-muted">Next position</p>
                <p className="mt-2 text-sm font-semibold text-text-primary">
                  {pointsToNext ? `${pointsToNext} points away` : "You set the pace"}
                </p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto h-[23rem] w-full max-w-[31rem]" aria-label="League podium">
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-accent/20" />
            <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/15" />
            {podiumOrder.map((podiumIndex, visualIndex) => {
              const entry = podium[podiumIndex];
              if (!entry) return null;
              const positions = [
                "left-[4%] top-[43%]",
                "left-1/2 top-[4%] -translate-x-1/2",
                "right-[2%] top-[47%]",
              ];
              return (
                <motion.article
                  key={`${metric}-${country}-${entry.id}`}
                  className={cn("absolute w-36 text-center sm:w-40", positions[visualIndex])}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -7, 0] }}
                  transition={{
                    opacity: { duration: 0.35, delay: visualIndex * 0.08 },
                    scale: { type: "spring", stiffness: 220, damping: 18, delay: visualIndex * 0.08 },
                    y: { duration: 4 + visualIndex, repeat: Infinity, ease: "easeInOut" },
                  }}
                >
                  <div className={cn(
                    "relative mx-auto grid place-items-center rounded-full border bg-bg-base shadow-2xl",
                    podiumIndex === 0 ? "h-28 w-28 border-amber-300/60" : "h-20 w-20 border-border",
                    entry.isStudent && "ring-4 ring-accent/20",
                  )}>
                    <span className={cn(
                      "grid rounded-full bg-gradient-to-br font-heading font-black text-white",
                      podiumIndex === 0 ? "h-24 w-24 place-items-center text-2xl" : "h-16 w-16 place-items-center",
                      entry.avatarTone,
                    )}>
                      {initials(entry.name)}
                    </span>
                    <span className={cn(
                      "absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full border bg-bg-base font-mono text-xs font-bold",
                      podiumIndex === 0 ? "border-amber-300 text-amber-300" : "border-border text-text-secondary",
                    )}>
                      {podiumIndex + 1}
                    </span>
                  </div>
                  <h2 className="mt-3 truncate font-heading font-bold">
                    {entry.isStudent ? `${entry.name} · You` : entry.name}
                  </h2>
                  <p className="mt-1 font-mono text-xs font-bold text-accent">
                    {liveMetricValue(entry)}{metricSuffix(metric)}
                  </p>
                  <p className="mt-1 text-[0.68rem] uppercase text-text-muted">{countryCodes[entry.country] ?? entry.country}</p>
                </motion.article>
              );
            })}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
              <Trophy className="mx-auto h-8 w-8 text-amber-300" />
              <p className="mt-2 font-mono text-[0.6rem] uppercase text-text-muted">Current leaders</p>
            </div>
          </div>
        </div>
      </header>

      <section className="border-b border-border/70 bg-bg-base/55 px-5 py-5 backdrop-blur-md sm:px-8 lg:px-12">
        <div className="flex gap-8 overflow-x-auto pb-1">
          {[
            ["Submit task", "+60", BookOpenCheck],
            ["Tutor review", "+20", CheckCircle2],
            ["Attend class", "+40", Trophy],
            ["Complete session", "+25", Sparkles],
            ["Active streak", "+15", Flame],
          ].map(([label, value, Icon]) => (
            <div key={String(label)} className="flex shrink-0 items-center gap-3">
              <Icon className="h-4 w-4 text-accent" />
              <span className="text-sm text-text-secondary">{String(label)}</span>
              <span className="font-mono text-xs font-bold text-accent">{String(value)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 lg:px-12">
        <div className="grid gap-8 xl:grid-cols-[18rem_1fr]">
          <aside className="space-y-8 xl:sticky xl:top-8 xl:self-start">
            <div>
              <p className="font-mono text-[0.65rem] uppercase text-accent">Race controls</p>
              <h2 className="mt-2 font-heading text-3xl font-bold">Change the lens</h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Compare momentum, finished work, attendance, or consistency.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(metricLabels) as LeagueMetric[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setMetric(item)}
                  className={cn(
                    "min-h-11 border px-3 text-left text-xs font-bold transition",
                    metric === item
                      ? "border-accent bg-accent text-bg-base"
                      : "border-border bg-bg-card/50 text-text-secondary hover:border-accent/45 hover:text-text-primary",
                  )}
                >
                  {metricLabels[item]}
                </button>
              ))}
            </div>

            <label className="flex h-12 items-center gap-3 border-y border-border px-1">
              <Globe2 className="h-4 w-4 text-accent" />
              <span className="sr-only">Filter country</span>
              <select
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="h-full flex-1 bg-transparent text-sm text-text-secondary outline-none"
              >
                {countries.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>

            <div className="border-l-2 border-accent/45 pl-4">
              <div className="flex items-center gap-2 text-accent">
                <Target className="h-4 w-4" />
                <p className="font-mono text-[0.65rem] uppercase">Your next boost</p>
              </div>
              <p className="mt-3 font-heading text-xl font-bold">
                {homeworkCompletion < 100 ? "Finish one unlocked task" : "Protect your class streak"}
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {homeworkCompletion < 100
                  ? `${studentScore.submittedTasks}/${unlockedTasks} available tasks submitted.`
                  : `${studentScore.currentStreak} classes in your current streak.`}
              </p>
              <div className="mt-4 h-1.5 overflow-hidden bg-white/[0.06]">
                <motion.div
                  className="h-full bg-[linear-gradient(90deg,#ff9c52,#6ee7b7,#75a7ff)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(3, homeworkCompletion)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </aside>

          <div>
            <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase text-accent">
                  <Radio className="h-3.5 w-3.5" />
                  Practice pace updates every 18 seconds
                </div>
                <h2 className="mt-2 font-heading text-3xl font-bold">The field</h2>
              </div>
              <p className="max-w-md text-sm text-text-secondary">
                Benchmarks are calibrated to your current course stage, so a new student is never compared with a graduate.
              </p>
            </div>

            <div className="mt-3">
              <AnimatePresence mode="popLayout">
                {rest.map((entry, index) => {
                  const value = liveMetricValue(entry);
                  const rank = index + 4;
                  return (
                    <motion.article
                      layout
                      key={`${metric}-${country}-${entry.id}`}
                      className={cn(
                        "group relative grid min-h-[5.3rem] items-center gap-3 border-b border-border/65 px-2 py-3 sm:grid-cols-[3.2rem_1fr_minmax(8rem,0.75fr)_auto]",
                        entry.isStudent && "bg-accent/[0.075]",
                      )}
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 18 }}
                      transition={{ delay: Math.min(index * 0.018, 0.22) }}
                    >
                      {entry.isStudent ? (
                        <motion.span
                          className="absolute inset-y-0 left-0 w-0.5 bg-accent"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.8, repeat: Infinity }}
                        />
                      ) : null}
                      <span className={cn(
                        "font-heading text-2xl font-black",
                        entry.isStudent ? "text-accent" : "text-text-muted",
                      )}>
                        {String(rank).padStart(2, "0")}
                      </span>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={cn(
                          "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
                          entry.avatarTone,
                        )}>
                          {initials(entry.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-heading font-bold">
                            {entry.isStudent ? `${entry.name} · You` : entry.name}
                          </p>
                          <p className="mt-1 text-xs text-text-muted">
                            {countryCodes[entry.country] ?? entry.country} · Stage {entry.stage}
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <div className="relative h-1.5 overflow-hidden bg-white/[0.055]">
                          <motion.div
                            className={cn(
                              "absolute inset-y-0 left-0",
                              entry.isStudent
                                ? "bg-[linear-gradient(90deg,#ff9c52,#6ee7b7,#75a7ff)]"
                                : "bg-text-muted/35 group-hover:bg-accent/45",
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(3, (value / maxValue) * 100)}%` }}
                            transition={{ duration: 0.7, delay: Math.min(index * 0.018, 0.2) }}
                          />
                        </div>
                        <div className="mt-2 flex gap-4 text-[0.68rem] text-text-muted">
                          <span>{entry.submittedTasks} tasks</span>
                          <span>{entry.currentStreak} streak</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 sm:justify-end">
                        <span className="font-mono text-sm font-bold text-accent">
                          {value}{metricSuffix(metric)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-text-muted transition group-hover:translate-x-1 group-hover:text-accent" />
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <footer className="flex flex-col gap-3 border-y border-border/70 bg-bg-card/35 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <UsersRound className="h-5 w-5 text-accent" />
          <div>
            <p className="font-heading font-bold">Privacy-safe by design</p>
            <p className="text-xs text-text-secondary">Only your own activity is real and personally identifiable.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase text-text-muted">
          <Medal className="h-4 w-4 text-amber-300" />
          {ranked.length} calibrated profiles
        </div>
      </footer>
    </main>
  );
}

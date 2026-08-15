"use client";

import { useMemo, useState } from "react";
import { BookOpenCheck, CheckCircle2, ChevronDown, LockKeyhole } from "lucide-react";
import { ModuleThreeQuizCard } from "@/components/portal/module-three-quiz";
import { HomeworkCard } from "@/components/ui/homework-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { CourseSession, HomeworkItem } from "@/lib/course-data";
import { getReachedSessionAccessBoundary } from "@/lib/content-access";
import type { ModuleThreeQuizActivity } from "@/lib/module-three-quizzes";
import { cn } from "@/lib/utils";

export function HomeworkTracker({
  homework,
  sessions,
  quizActivities,
  initialSessionId,
}: {
  homework: HomeworkItem[];
  sessions: CourseSession[];
  quizActivities: ModuleThreeQuizActivity[];
  initialSessionId?: string;
}) {
  const availableSessions = useMemo(
    () => [...sessions].sort((a, b) => a.globalNumber - b.globalNumber),
    [sessions],
  );
  const accessBoundary = useMemo(
    () => getReachedSessionAccessBoundary(sessions),
    [sessions],
  );
  const firstSessionWithWork =
    availableSessions.find((session) =>
      homework.some((item) => item.sessionId === session.id) ||
      quizActivities.some((activity) => activity.sessionId === session.id)
    )?.id ??
    availableSessions[0]?.id;
  const initialAvailableSessionId = availableSessions.some((session) => session.id === initialSessionId)
    ? initialSessionId
    : firstSessionWithWork;
  const [activeSessionId, setActiveSessionId] = useState(initialAvailableSessionId);
  const grouped = useMemo(
    () =>
      availableSessions.map((session) => {
        const items = homework.filter((item) => item.sessionId === session.id);
        const quiz = quizActivities.find((activity) => activity.sessionId === session.id);
        const completedTasks = items.filter(
          (item) => item.status === "submitted" || item.status === "reviewed",
        ).length;
        return {
          session,
          items,
          quiz,
          completed: completedTasks + (quiz?.attempts.length ? 1 : 0),
          total: items.length + (quiz ? 1 : 0),
        };
      }),
    [availableSessions, homework, quizActivities],
  );
  const active = grouped.find((item) => item.session.id === activeSessionId) ?? grouped[0];
  const activeReached = Boolean(
    active && active.session.globalNumber <= accessBoundary.maxUnlockedGlobalNumber,
  );
  const overallCompleted =
    homework.filter((item) => item.status === "submitted" || item.status === "reviewed").length +
    quizActivities.filter((activity) => activity.attempts.length > 0).length;
  const overallTotal = homework.length + quizActivities.length;
  const moduleGroups = useMemo(
    () =>
      [1, 2, 3]
        .map((moduleNumber) => ({
          moduleNumber,
          sessions: grouped.filter((item) => Math.ceil(item.session.globalNumber / 8) === moduleNumber),
        }))
        .filter((module) => module.sessions.length > 0),
    [grouped],
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.3fr]">
      <section className="premium-card rounded-xl p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
            <BookOpenCheck className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-heading text-xl font-bold">Session Workbook</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {overallCompleted}/{overallTotal} activities completed
            </p>
          </div>
        </div>
        <ProgressBar className="mt-5" value={overallCompleted} max={Math.max(overallTotal, 1)} label="Workbook progress" />

        <div className="mt-6 max-h-[70vh] space-y-5 overflow-y-auto pr-1 scrollbar-soft">
          {moduleGroups.map((module) => (
            <details
              key={module.moduleNumber}
              className="group rounded-xl border border-border/70 bg-white/[0.02]"
              open={module.sessions.some((item) => item.session.id === active?.session.id)}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between p-3">
                <p className="font-mono text-xs uppercase text-accent">Module {module.moduleNumber}</p>
                <ChevronDown className="h-4 w-4 text-text-muted transition group-open:rotate-180" />
              </summary>
              <div className="space-y-2 px-2 pb-2">
                {module.sessions.map(({ session, total, completed }) => {
                  const isActive = session.id === active?.session.id;
                  return (
                    <button
                      key={session.id}
                      onClick={() => {
                        setActiveSessionId(session.id);
                        window.history.replaceState(
                          window.history.state,
                          "",
                          `/homework?session=${encodeURIComponent(session.id)}`,
                        );
                      }}
                      className={cn(
                        "w-full rounded-xl border p-4 text-left transition",
                        isActive
                          ? "border-accent/50 bg-accent/10 shadow-[0_0_24px_rgba(110,231,183,0.12)]"
                          : "border-border bg-bg-card hover:border-accent/25 hover:bg-white/[0.035]",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-xs uppercase text-text-muted">
                            Session {session.sessionNumber}
                          </p>
                          <h3 className="mt-1 font-heading font-bold">{session.title}</h3>
                        </div>
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 font-mono text-[11px]",
                            total === 0 && "border-border text-text-muted",
                            total > 0 &&
                              completed < total &&
                              "border-accent-warm/40 bg-accent-warm/10 text-[color:var(--accent-warm)]",
                            total > 0 &&
                              completed === total &&
                              "border-success/35 bg-success/10 text-[color:var(--success)]",
                          )}
                        >
                          {total === 0 ? "No work" : `${completed}/${total}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {active ? (
          <div className="premium-card rounded-xl p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-mono text-xs uppercase text-accent">
                  Module {Math.ceil(active.session.globalNumber / 8)} · Session {active.session.sessionNumber}
                </p>
                <h2 className="mt-2 font-heading text-2xl font-bold">{active.session.title}</h2>
                {activeReached ? (
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                    {active.session.focus}
                  </p>
                ) : (
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                    This session is visible on your course map. Its project briefs, tools, and
                    knowledge check unlock when you reach it.
                  </p>
                )}
              </div>
              <ChevronDown className="hidden h-5 w-5 text-text-muted md:block" />
            </div>
          </div>
        ) : null}

        {active && !activeReached ? (
          <article className="premium-card overflow-hidden rounded-xl border border-accent/20">
            <div className="relative p-7 sm:p-8">
              <div className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(circle_at_right,rgba(110,231,183,0.1),transparent_66%)]" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                  <LockKeyhole className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-mono text-xs uppercase text-accent">Session preview</p>
                  <h3 className="mt-2 font-heading text-2xl font-bold">
                    Your next workspace is still sealed
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                    Reach Session {active.session.sessionNumber} to reveal one class challenge,
                    one home task, the n8n tools used, and a short five-question knowledge check.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2 font-mono text-[11px] uppercase text-text-muted">
                    <span className="rounded-full border border-border bg-white/[0.025] px-3 py-1.5">
                      1 class challenge
                    </span>
                    <span className="rounded-full border border-border bg-white/[0.025] px-3 py-1.5">
                      1 home task
                    </span>
                    <span className="rounded-full border border-border bg-white/[0.025] px-3 py-1.5">
                      5 quiz questions
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ) : active?.items.length || active?.quiz ? (
          <div className="grid gap-4">
            {[...active.items]
              .sort((a, b) => a.kind.localeCompare(b.kind))
              .map((item) => (
                <HomeworkCard
                  key={item.id}
                  homework={item}
                  toolsUnlocked={activeReached}
                />
              ))}
            {active.quiz ? <ModuleThreeQuizCard activity={active.quiz} /> : null}
          </div>
        ) : (
          <div className="premium-card rounded-xl p-10 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-accent" />
            <h2 className="mt-4 font-heading text-2xl font-bold">No work added yet</h2>
            <p className="mt-2 text-text-secondary">
              Class challenges and home tasks will appear here when they are attached to this session.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

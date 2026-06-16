"use client";

import { useMemo, useState } from "react";
import { BookOpenCheck, CheckCircle2, ChevronDown } from "lucide-react";
import { HomeworkCard } from "@/components/ui/homework-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getSessionAccessBoundary } from "@/lib/content-access";
import type { CourseSession, HomeworkItem } from "@/lib/course-data";
import { cn } from "@/lib/utils";

export function HomeworkTracker({
  homework,
  sessions,
}: {
  homework: HomeworkItem[];
  sessions: CourseSession[];
}) {
  const unlockedSessions = useMemo(() => {
    const access = getSessionAccessBoundary(sessions);
    return sessions.filter((session) => session.globalNumber <= access.maxUnlockedGlobalNumber);
  }, [sessions]);
  const firstSessionWithWork =
    unlockedSessions.find((session) => homework.some((item) => item.sessionId === session.id))?.id ??
    unlockedSessions[0]?.id;
  const [activeSessionId, setActiveSessionId] = useState(firstSessionWithWork);
  const grouped = useMemo(
    () =>
      unlockedSessions.map((session) => {
        const items = homework.filter((item) => item.sessionId === session.id);
        const completed = items.filter((item) => item.status !== "pending").length;
        return {
          session,
          items,
          completed,
          total: items.length,
        };
      }),
    [homework, unlockedSessions],
  );
  const active = grouped.find((item) => item.session.id === activeSessionId) ?? grouped[0];
  const overallCompleted = homework.filter((item) => item.status !== "pending").length;
  const moduleGroups = useMemo(
    () =>
      [1, 2, 3].map((moduleNumber) => ({
        moduleNumber,
        sessions: grouped.filter((item) => Math.ceil(item.session.globalNumber / 8) === moduleNumber),
      })),
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
              {overallCompleted}/{homework.length} items completed
            </p>
          </div>
        </div>
        <ProgressBar className="mt-5" value={overallCompleted} max={Math.max(homework.length, 1)} label="Workbook progress" />

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
                      onClick={() => setActiveSessionId(session.id)}
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
                <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                  {active.session.focus}
                </p>
              </div>
              <ChevronDown className="hidden h-5 w-5 text-text-muted md:block" />
            </div>
          </div>
        ) : null}

        {active?.items.length ? (
          <div className="grid gap-4">
            {active.items
              .sort((a, b) => a.kind.localeCompare(b.kind))
              .map((item) => (
                <HomeworkCard key={item.id} homework={item} />
              ))}
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

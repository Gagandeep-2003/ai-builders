"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SessionCard } from "@/components/ui/session-card";
import type { CourseModule } from "@/lib/course-data";
import type { CurriculumSession } from "@/lib/data";
import { cn } from "@/lib/utils";

export function CurriculumTabs({
  modules,
  sessions,
}: {
  modules: CourseModule[];
  sessions: CurriculumSession[];
}) {
  const [activeModule, setActiveModule] = useState(modules[0]?.id ?? "");
  const activeSessions = useMemo(
    () => sessions.filter((session) => session.moduleId === activeModule),
    [sessions, activeModule],
  );

  return (
    <div className="space-y-6">
      <div className="flex overflow-x-auto rounded-xl border border-border bg-bg-card p-1 scrollbar-soft">
        {modules.map((module) => {
          const active = module.id === activeModule;
          return (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={cn(
                "relative min-w-fit rounded-xl px-4 py-2.5 text-sm text-text-secondary transition",
                active && "text-bg-base",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="module-tab"
                  className="absolute inset-0 rounded-xl bg-accent"
                  transition={{ duration: 0.22 }}
                />
              ) : null}
              <span className="relative font-bold">Module {module.orderIndex}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {activeSessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            isActive={session.status === "current"}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { CheckCircle2, Lock, Radio } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { MotionDiv } from "@/components/ui/animated";
import { cn, formatDate } from "@/lib/utils";
import type { CurriculumSession } from "@/lib/data";

const icons = {
  completed: CheckCircle2,
  current: Radio,
  locked: Lock,
};

export function SessionCard({
  session,
  isActive,
}: {
  session: CurriculumSession;
  isActive?: boolean;
}) {
  const Icon = icons[session.status];

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: session.status === "locked" ? 0 : -3 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={cn(
        "premium-card premium-card-hover rounded-xl p-5",
        session.status === "locked" && "opacity-55",
        (session.status === "current" || isActive) &&
          "ambient-pulse border-accent/55 shadow-[0_0_32px_rgba(110,231,183,0.12)]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-bg-elevated font-mono text-xs text-accent">
            {session.sessionNumber}
          </span>
          <div>
            <h3 className="font-heading text-base font-bold">{session.title}</h3>
            <p className="mt-1 font-mono text-xs text-text-muted">{formatDate(session.date)}</p>
          </div>
        </div>
        <StatusBadge status={session.status} />
      </div>
      <p className="mt-4 text-sm leading-6 text-text-secondary">{session.focus}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {session.toolsCovered.map((tool) => (
          <span
            key={tool}
            className="rounded-full border border-border bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-text-secondary"
          >
            {tool}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-2 border-t border-border/60 pt-4 text-sm text-text-secondary">
        <Icon className="h-4 w-4 text-accent" />
        <span>{session.studentOutput}</span>
      </div>
    </MotionDiv>
  );
}

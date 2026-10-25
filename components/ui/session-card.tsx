"use client";

import { CheckCircle2, CircleMinus, CircleOff, Lock, Radio } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { MotionDiv } from "@/components/ui/animated";
import { ToolLinkChip } from "@/components/ui/tool-link-chip";
import { ToolAccessHint } from "@/components/ui/tool-access-hint";
import { cn, formatDate } from "@/lib/utils";
import type { CourseSessionStatus } from "@/lib/course-data";
import type { CurriculumSession } from "@/lib/data";

type SessionCardSession = Omit<CurriculumSession, "status"> & {
  status: CourseSessionStatus;
};

const statusDetails: Record<
  CourseSessionStatus,
  {
    Icon: typeof CheckCircle2;
    label: string;
    iconClassName: string;
    notice?: string;
  }
> = {
  completed: {
    Icon: CheckCircle2,
    label: "Completed",
    iconClassName: "text-success",
  },
  current: {
    Icon: Radio,
    label: "Current",
    iconClassName: "text-accent",
  },
  locked: {
    Icon: Lock,
    label: "Locked",
    iconClassName: "text-accent",
  },
  skipped: {
    Icon: CircleMinus,
    label: "Skipped",
    iconClassName: "text-text-muted",
    notice: "Skipped in your current course schedule.",
  },
  not_enrolled: {
    Icon: CircleOff,
    label: "Not enrolled",
    iconClassName: "text-text-muted",
    notice: "This session is outside your current enrollment.",
  },
};

export type SessionCardProps = {
  session: SessionCardSession;
  isActive?: boolean;
};

function getSessionDateLabel(session: SessionCardSession) {
  if (!session.date) {
    if (session.status === "skipped") return "Outside schedule";
    if (session.status === "not_enrolled") return "Not scheduled";
    return "Schedule pending";
  }

  const date = new Date(session.date);
  return Number.isNaN(date.getTime()) ? "Schedule pending" : formatDate(date);
}

export function SessionCard({
  session,
  isActive,
}: SessionCardProps) {
  const status = statusDetails[session.status];
  const Icon = status.Icon;
  const isUnavailable = session.status === "skipped" || session.status === "not_enrolled";
  const highlightAsCurrent =
    session.status === "current" || (Boolean(isActive) && !isUnavailable);
  const dateLabel = getSessionDateLabel(session);

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: session.status === "locked" || isUnavailable ? 0 : -3 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={cn(
        "premium-card rounded-xl p-5",
        !isUnavailable && "premium-card-hover",
        session.status === "locked" && "opacity-55",
        isUnavailable && "no-border-glow border-border/70 bg-bg-card/60",
        highlightAsCurrent &&
          "ambient-pulse border-accent/55 shadow-[0_0_32px_rgba(110,231,183,0.12)]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid h-9 w-9 place-items-center rounded-xl border border-border bg-bg-elevated font-mono text-xs",
              isUnavailable ? "text-text-muted" : "text-accent",
            )}
          >
            {session.sessionNumber}
          </span>
          <div>
            <h3 className="font-heading text-base font-bold">{session.title}</h3>
            <p className="mt-1 font-mono text-xs text-text-muted">{dateLabel}</p>
          </div>
        </div>
        <StatusBadge
          status={session.status}
          label={status.label}
          className={isUnavailable ? "border-border bg-white/[0.03] text-text-muted shadow-none" : undefined}
        />
      </div>
      <p className="mt-4 text-sm leading-6 text-text-secondary">{session.focus}</p>
      {session.status === "locked" ? (
        <ToolAccessHint className="mt-4" />
      ) : isUnavailable ? (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated/60 px-3 py-1.5 text-xs text-text-muted">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{status.notice}</span>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {session.toolsCovered.map((tool) => (
            <ToolLinkChip key={tool} tool={tool} className="px-2.5" />
          ))}
        </div>
      )}
      <div className="mt-5 flex items-center gap-2 border-t border-border/60 pt-4 text-sm text-text-secondary">
        <Icon className={cn("h-4 w-4 shrink-0", status.iconClassName)} aria-hidden="true" />
        <span>
          {isUnavailable ? "Planned output: " : null}
          {session.studentOutput}
        </span>
      </div>
    </MotionDiv>
  );
}

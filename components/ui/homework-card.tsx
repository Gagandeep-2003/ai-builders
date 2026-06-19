import { CalendarDays, ExternalLink } from "lucide-react";
import { PendingLink } from "@/components/ui/pending-link";
import { StatusBadge } from "@/components/ui/status-badge";
import { ToolLinkChip } from "@/components/ui/tool-link-chip";
import { formatDuration, formatHomeworkKind } from "@/lib/homework-utils";
import { cn, formatDate, getDueTone } from "@/lib/utils";
import type { HomeworkItem } from "@/lib/course-data";

export function HomeworkCard({ homework }: { homework: HomeworkItem }) {
  const tone = getDueTone(homework.dueDate, homework.status);
  const progressLabel =
    homework.status !== "pending"
      ? "Complete"
      : homework.startedAt
        ? "In progress"
        : "Not started";

  return (
    <article className="premium-card premium-card-hover rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase text-text-muted">{homework.sessionName}</p>
          <h3 className="mt-2 font-heading text-lg font-bold">{homework.title}</h3>
          <p className="mt-2 font-mono text-xs uppercase text-accent">{formatHomeworkKind(homework.kind)}</p>
        </div>
        <StatusBadge status={homework.status} />
      </div>
      <p className="mt-4 text-sm leading-6 text-text-secondary">{homework.description}</p>
      {homework.details ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono text-[11px] uppercase text-text-secondary">
            Module {homework.details.moduleNumber} · Session {homework.details.sessionNumber}
          </span>
          {homework.details.tools.slice(0, 3).map((tool) => (
            <ToolLinkChip key={tool} tool={tool} />
          ))}
        </div>
      ) : null}
      <p className="mt-3 font-mono text-xs uppercase text-text-muted">{progressLabel}</p>
      {homework.timeSpentSeconds ? (
        <p className="mt-3 font-mono text-xs text-text-muted">
          Completed in {formatDuration(homework.timeSpentSeconds)}
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
            tone === "danger" && "border-danger/40 bg-danger/10 text-[color:var(--danger)]",
            tone === "warning" && "border-accent-warm/40 bg-accent-warm/10 text-[color:var(--accent-warm)]",
            tone === "success" && "border-success/35 bg-success/10 text-[color:var(--success)]",
          )}
        >
          <CalendarDays className="h-4 w-4" />
          Due {formatDate(homework.dueDate)}
        </span>
        <div>
          <PendingLink
            href={`/homework/${homework.id}`}
            pendingLabel="Opening task..."
            className="button-motion inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-bold text-accent"
          >
            <ExternalLink className="h-4 w-4" />
            {homework.startedAt ? "Continue Task" : "Start Task"}
          </PendingLink>
        </div>
      </div>
    </article>
  );
}

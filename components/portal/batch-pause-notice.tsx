import { CalendarClock, PauseCircle } from "lucide-react";
import type { Batch } from "@/lib/course-data";
import { getBatchPauseState } from "@/lib/time";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function BatchPauseNotice({ batch }: { batch: Batch }) {
  const { active, upcoming, dateKey } = getBatchPauseState(batch);
  const pause = active ?? upcoming;
  if (!pause) return null;

  const daysUntil = Math.ceil(
    (new Date(`${pause.startsOn}T00:00:00.000Z`).getTime() -
      new Date(`${dateKey}T00:00:00.000Z`).getTime()) /
      86_400_000,
  );
  if (!active && daysUntil > 30) return null;

  return (
    <aside className="relative overflow-hidden rounded-xl border border-accent-warm/30 bg-accent-warm/10 p-5">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-48 bg-[radial-gradient(circle_at_right,rgba(251,191,36,0.12),transparent_70%)]" />
      <div className="relative flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent-warm/30 bg-bg-card/70 text-accent-warm">
          {active ? <PauseCircle className="h-5 w-5" /> : <CalendarClock className="h-5 w-5" />}
        </span>
        <div>
          <p className="font-mono text-xs uppercase text-accent-warm">
            {active ? "Course schedule paused" : "Scheduled course break"}
          </p>
          <h2 className="mt-1 font-heading text-lg font-bold">
            {active
              ? `Classes resume on ${formatDate(pause.resumesOn)}`
              : `Break begins on ${formatDate(pause.startsOn)}`}
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {pause.reason || "Scheduled break"}. {active
              ? "There are no regular classes or attendance requirements during this break."
              : `Classes will pause until ${formatDate(pause.resumesOn)}.`} Your remaining sessions have moved forward automatically, so no course content is lost.
          </p>
        </div>
      </div>
    </aside>
  );
}


"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CalendarClock, CheckCircle2, CircleOff, Radio } from "lucide-react";
import type { CourseLevel, CourseLevelState } from "@/lib/course-data";
import { cn } from "@/lib/utils";

export type CourseLevelSwitcherItem = {
  level: CourseLevel;
  state: CourseLevelState;
  label?: string;
};

export type CourseLevelSwitcherProps = {
  selectedLevel: CourseLevel;
  items: CourseLevelSwitcherItem[];
  className?: string;
  paramName?: string;
};

const stateDetails = {
  current: {
    Icon: Radio,
    label: "Current",
    className: "border-accent/35 bg-accent/10 text-accent",
  },
  scheduled: {
    Icon: CalendarClock,
    label: "Scheduled",
    className: "border-info/30 bg-info/10 text-[color:var(--info)]",
  },
  completed: {
    Icon: CheckCircle2,
    label: "Completed",
    className: "border-success/30 bg-success/10 text-[color:var(--success)]",
  },
  not_enrolled: {
    Icon: CircleOff,
    label: "Not enrolled",
    className: "border-border bg-white/[0.03] text-text-muted",
  },
} satisfies Record<
  CourseLevelState,
  {
    Icon: typeof Radio;
    label: string;
    className: string;
  }
>;

export function CourseLevelSwitcher({
  selectedLevel,
  items,
  className,
  paramName = "level",
}: CourseLevelSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav
      aria-label="Course level"
      className={cn(
        "rounded-2xl border border-border/80 bg-bg-card/80 p-1.5 shadow-[0_18px_54px_rgba(0,0,0,0.2)] backdrop-blur-xl",
        className,
      )}
    >
      <ul className="grid grid-cols-2 gap-1.5">
        {items.map((item) => {
          const selected = item.level === selectedLevel;
          const state = stateDetails[item.state];
          const StateIcon = state.Icon;
          const params = new URLSearchParams(searchParams.toString());
          params.set(paramName, String(item.level));
          const query = params.toString();
          const href = query ? `${pathname}?${query}` : pathname;

          return (
            <li key={item.level} className="min-w-0">
              <Link
                href={href}
                scroll={false}
                aria-current={selected ? "page" : undefined}
                aria-label={`${item.label ?? `Level ${item.level}`}, ${state.label}`}
                className={cn(
                  "group relative flex min-h-11 w-full min-w-0 flex-col items-start justify-center gap-1.5 overflow-hidden rounded-xl border px-3 py-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:px-4",
                  selected
                    ? "border-accent/45 bg-accent/12 text-text-primary shadow-[0_0_28px_rgba(110,231,183,0.12)]"
                    : "border-transparent bg-white/[0.02] text-text-secondary hover:border-border hover:bg-white/[0.045] hover:text-text-primary",
                )}
              >
                {selected ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent"
                  />
                ) : null}

                <span className="relative min-w-0">
                  <span className="block truncate font-heading text-sm font-bold sm:text-base">
                    {item.label ?? `Level ${item.level}`}
                  </span>
                </span>

                <span
                  className={cn(
                    "relative inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wide sm:text-[10px]",
                    state.className,
                  )}
                >
                  <StateIcon className="h-3 w-3" aria-hidden="true" />
                  <span>{state.label}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

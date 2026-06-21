"use client";

import { useMemo, useState } from "react";
import { LockKeyhole, Sparkles } from "lucide-react";
import { BadgeMedallion } from "@/components/portal/badge-medallion";
import type { BadgeProgress, StudentBadge } from "@/lib/course-data";
import { cn, formatDate } from "@/lib/utils";

const filters = ["all", "earned", "curriculum", "homework", "attendance", "streak", "mentor"] as const;

export function AchievementGallery({
  progress,
  awards,
}: {
  progress: BadgeProgress[];
  awards: StudentBadge[];
}) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const awardsBySlug = useMemo(() => new Map(awards.map((award) => [award.definition.slug, award])), [awards]);
  const visible = progress.filter((item) => {
    if (filter === "all") return true;
    if (filter === "earned") return item.earned;
    return item.definition.category === filter;
  });

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-accent">Achievement vault</p>
          <h2 className="mt-2 font-heading text-3xl font-bold">Badges earned through real progress</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Complete sessions, submit strong work, protect your attendance streak, and earn special mentor recognition.
          </p>
        </div>
        <span className="font-mono text-sm text-accent">{awards.length}/{progress.length} unlocked</span>
      </div>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-soft">
        {filters.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase transition",
              filter === item ? "border-accent bg-accent text-bg-base" : "border-border bg-bg-card text-text-secondary hover:border-accent/40",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((item) => {
          const award = awardsBySlug.get(item.definition.slug);
          return (
            <article
              key={item.definition.slug}
              className={cn(
                "relative overflow-hidden rounded-xl border p-5",
                item.earned ? "border-accent/25 bg-bg-card" : "border-border/70 bg-bg-card/55",
              )}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full blur-3xl"
                style={{ backgroundColor: `${item.definition.color}18` }}
              />
              <div className="relative flex gap-4">
                <BadgeMedallion badge={item.definition} earned={item.earned} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-[10px] uppercase text-text-muted">{item.definition.rarity} · {item.definition.category}</p>
                      <h3 className="mt-1 font-heading text-lg font-bold">{item.definition.name}</h3>
                    </div>
                    {item.earned ? <Sparkles className="h-4 w-4 text-accent" /> : <LockKeyhole className="h-4 w-4 text-text-muted" />}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{item.definition.description}</p>
                </div>
              </div>
              <div className="relative mt-4">
                {item.earned ? (
                  <p className="font-mono text-[11px] uppercase text-accent">
                    Earned {award?.awardedAt ? formatDate(award.awardedAt) : "through your progress"}
                  </p>
                ) : item.definition.mentorAwarded ? (
                  <p className="font-mono text-[11px] uppercase text-text-muted">Mentor-awarded distinction</p>
                ) : (
                  <>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${item.percent}%` }} />
                    </div>
                    <p className="mt-2 font-mono text-[11px] uppercase text-text-muted">{item.current}/{item.target} complete</p>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

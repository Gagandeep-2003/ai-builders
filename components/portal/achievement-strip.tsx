import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BadgeMedallion } from "@/components/portal/badge-medallion";
import type { BadgeProgress, StudentBadge } from "@/lib/course-data";

export function AchievementStrip({
  awards,
  progress,
  title = "Achievements",
}: {
  awards: StudentBadge[];
  progress: BadgeProgress[];
  title?: string;
}) {
  const next = progress.filter((item) => !item.earned && !item.definition.mentorAwarded).sort((a, b) => b.percent - a.percent)[0];
  return (
    <section className="rounded-xl border border-accent/20 bg-bg-card p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-accent">{title}</p>
          <h2 className="mt-2 font-heading text-xl font-bold">
            {awards.length ? `${awards.length} badge${awards.length === 1 ? "" : "s"} in your vault` : "Your first badge is close"}
          </h2>
          {next ? <p className="mt-2 text-sm text-text-secondary">Next: {next.definition.name} · {next.current}/{next.target}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {awards.slice(0, 4).map((award) => <BadgeMedallion key={award.id} badge={award.definition} size="sm" />)}
          <Link href="/progress#achievements" className="ml-2 inline-flex items-center gap-2 text-sm font-bold text-accent">
            View vault <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

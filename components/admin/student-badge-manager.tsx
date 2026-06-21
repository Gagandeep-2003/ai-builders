"use client";

import { Award, Trash2 } from "lucide-react";
import { awardMentorBadgeAction, revokeMentorBadgeAction } from "@/app/actions/admin";
import { BadgeMedallion } from "@/components/portal/badge-medallion";
import { SubmitButton } from "@/components/ui/submit-button";
import type { BadgeDefinition, StudentBadge } from "@/lib/course-data";

export function StudentBadgeManager({
  studentId,
  definitions,
  awards,
}: {
  studentId: string;
  definitions: BadgeDefinition[];
  awards: StudentBadge[];
}) {
  const mentorDefinitions = definitions.filter((badge) => badge.mentorAwarded);
  const awardedIds = new Set(awards.map((award) => award.badgeId));
  const available = mentorDefinitions.filter((badge) => !awardedIds.has(badge.id));

  return (
    <details className="mt-4 rounded-xl border border-border/70 bg-white/[0.025] p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-heading font-bold">
          <Award className="h-4 w-4 text-accent" />
          Achievements
        </span>
        <span className="font-mono text-xs text-accent">{awards.length} earned</span>
      </summary>
      <div className="mt-4 space-y-4 border-t border-border/60 pt-4">
        {awards.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {awards.map((award) => (
              <div key={award.id} className="flex items-center gap-3 rounded-lg border border-border/70 bg-bg-base/40 p-3">
                <BadgeMedallion badge={award.definition} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{award.definition.name}</p>
                  <p className="font-mono text-[10px] uppercase text-text-muted">{award.source}</p>
                </div>
                {award.source === "mentor" ? (
                  <form action={revokeMentorBadgeAction}>
                    <input type="hidden" name="awardId" value={award.id} />
                    <SubmitButton pendingLabel="..." className="rounded-lg border border-danger/25 p-2 text-danger">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Revoke badge</span>
                    </SubmitButton>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-text-secondary">No badges earned yet.</p>}

        {available.length ? (
          <form action={awardMentorBadgeAction} className="rounded-xl border border-accent/20 bg-accent/5 p-4">
            <input type="hidden" name="studentId" value={studentId} />
            <p className="font-mono text-[10px] uppercase text-accent">Award mentor badge</p>
            <select name="badgeId" required className="mt-3 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-sm">
              <option value="">Choose recognition</option>
              {available.map((badge) => <option key={badge.id} value={badge.id}>{badge.name}</option>)}
            </select>
            <textarea name="mentorNote" placeholder="Optional personal note shown with the badge" className="mt-3 min-h-20 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-sm" />
            <SubmitButton pendingLabel="Awarding..." className="mt-3 w-full rounded-lg bg-accent px-4 py-2.5 font-bold text-bg-base">
              Award badge
            </SubmitButton>
          </form>
        ) : null}
      </div>
    </details>
  );
}

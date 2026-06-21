import { Gift, Mail, UserRound } from "lucide-react";
import { updateReferralAction } from "@/app/actions/referrals";
import { SubmitButton } from "@/components/ui/submit-button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ReferralSubmission, ReferralStatus } from "@/lib/course-data";
import { formatDate } from "@/lib/utils";

const statuses: ReferralStatus[] = ["pending", "contacted", "enrolled", "rewarded", "closed"];

export function AdminReferralsBoard({ referrals }: { referrals: ReferralSubmission[] }) {
  return (
    <div className="grid gap-4">
      {referrals.length ? referrals.map((referral) => (
        <article key={referral.id} className="premium-card rounded-xl p-5">
          <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                    <Gift className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-heading text-xl font-bold">{referral.referredName}</h2>
                    <p className="mt-1 text-sm text-text-secondary">
                      Referred by {referral.studentName || "Student"} · {referral.relationship}
                    </p>
                  </div>
                </div>
                <StatusBadge status={referral.status} />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
                  <Mail className="h-4 w-4 text-accent" />
                  <p className="mt-2 font-mono text-xs uppercase text-text-muted">Contact</p>
                  <p className="mt-1 break-all text-sm">{referral.referredContact}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
                  <UserRound className="h-4 w-4 text-accent" />
                  <p className="mt-2 font-mono text-xs uppercase text-text-muted">Submitted</p>
                  <p className="mt-1 text-sm">{formatDate(referral.createdAt)}</p>
                </div>
              </div>
              {referral.note ? <p className="mt-4 text-sm leading-6 text-text-secondary">{referral.note}</p> : null}
            </div>

            <form action={updateReferralAction} className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
              <input type="hidden" name="referralId" value={referral.id} />
              <label className="block">
                <span className="font-mono text-xs uppercase text-text-muted">Status</span>
                <select name="status" defaultValue={referral.status} className="mt-2 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm">
                  {statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>
              <label className="mt-4 block">
                <span className="font-mono text-xs uppercase text-text-muted">Student-visible note</span>
                <textarea name="adminNote" defaultValue={referral.adminNote} className="mt-2 min-h-24 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm" />
              </label>
              <SubmitButton pendingLabel="Updating..." className="mt-4 w-full rounded-xl bg-accent px-4 py-3 font-bold text-bg-base">
                Update Referral
              </SubmitButton>
            </form>
          </div>
        </article>
      )) : (
        <div className="premium-card rounded-xl p-10 text-center">
          <Gift className="mx-auto h-8 w-8 text-accent" />
          <h2 className="mt-4 font-heading text-xl font-bold">No referrals yet</h2>
          <p className="mt-2 text-text-secondary">Student introductions will appear here for follow-up.</p>
        </div>
      )}
    </div>
  );
}

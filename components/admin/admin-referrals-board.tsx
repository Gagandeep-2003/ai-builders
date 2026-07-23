import {
  ArrowRight,
  CircleDollarSign,
  Gift,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { updateReferralAction } from "@/app/actions/referrals";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ReferralSubmission, ReferralStatus } from "@/lib/course-data";
import { formatDate } from "@/lib/utils";

const statuses: { value: ReferralStatus; label: string }[] = [
  { value: "pending", label: "Submitted - needs first contact" },
  { value: "contacted", label: "Contacted - conversation active" },
  { value: "enrolled", label: "Enrolled - $100 due after first paid class" },
  { value: "rewarded", label: "$100 paid" },
  { value: "closed", label: "Closed - not proceeding" },
];

const statusMeta: Record<
  ReferralStatus,
  { label: string; nextAction: string; tone: string }
> = {
  pending: {
    label: "New lead",
    nextAction: "Contact the referred learner or parent.",
    tone: "border-info/30 bg-info/10 text-[color:var(--info)]",
  },
  contacted: {
    label: "Contacted",
    nextAction: "Follow up and confirm whether they want to enrol.",
    tone: "border-amber-300/30 bg-amber-300/10 text-amber-300",
  },
  enrolled: {
    label: "$100 due",
    nextAction: "Confirm the first paid live class, then mark the bonus as paid.",
    tone: "border-accent/30 bg-accent/10 text-accent",
  },
  rewarded: {
    label: "$100 paid",
    nextAction: "Complete. The referrer can see that payment is confirmed.",
    tone: "border-accent/40 bg-accent/15 text-accent",
  },
  closed: {
    label: "Closed",
    nextAction: "No further follow-up is currently required.",
    tone: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  },
};

export function AdminReferralsBoard({ referrals }: { referrals: ReferralSubmission[] }) {
  return (
    <div className="grid gap-4">
      {referrals.length ? referrals.map((referral) => {
        const meta = statusMeta[referral.status];
        return (
          <article key={referral.id} className="premium-card rounded-lg p-5">
            <div className="grid gap-5 xl:grid-cols-[1fr_0.92fr]">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
                      <Gift className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-heading text-xl font-bold">{referral.referredName}</h2>
                      <p className="mt-1 text-sm text-text-secondary">
                        Referred by {referral.studentName || "Student"} · {referral.relationship}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full border px-3 py-1 font-mono text-[0.68rem] uppercase ${meta.tone}`}>
                    {meta.label}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border/70 bg-white/[0.025] p-4">
                    <Mail className="h-4 w-4 text-accent" />
                    <p className="mt-2 font-mono text-xs uppercase text-text-muted">Contact</p>
                    <p className="mt-1 break-all text-sm">{referral.referredContact}</p>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-white/[0.025] p-4">
                    <UserRound className="h-4 w-4 text-accent" />
                    <p className="mt-2 font-mono text-xs uppercase text-text-muted">Submitted</p>
                    <p className="mt-1 text-sm">{formatDate(referral.createdAt)}</p>
                  </div>
                </div>

                {referral.note ? (
                  <div className="mt-4 border-l-2 border-accent/40 pl-4">
                    <p className="font-mono text-[0.68rem] uppercase text-text-muted">Student context</p>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">{referral.note}</p>
                  </div>
                ) : null}

                <div className="mt-5 flex gap-3 rounded-lg border border-amber-300/25 bg-amber-300/[0.07] p-4">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <div>
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-amber-300">Next action</p>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">{meta.nextAction}</p>
                  </div>
                </div>
              </div>

              <form action={updateReferralAction} className="rounded-lg border border-border/70 bg-white/[0.025] p-4">
                <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-4">
                  <div className="flex items-center gap-3">
                    <CircleDollarSign className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-heading font-bold">$100 reward pipeline</p>
                      <p className="mt-0.5 text-xs text-text-muted">Payment is manually confirmed by you.</p>
                    </div>
                  </div>
                  {referral.status === "rewarded" ? <ShieldCheck className="h-5 w-5 text-accent" /> : null}
                </div>
                <input type="hidden" name="referralId" value={referral.id} />
                <label className="mt-4 block">
                  <span className="font-mono text-xs uppercase text-text-muted">Campaign status</span>
                  <select
                    name="status"
                    defaultValue={referral.status}
                    className="mt-2 w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm"
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </label>
                <label className="mt-4 block">
                  <span className="font-mono text-xs uppercase text-text-muted">Student-visible update</span>
                  <textarea
                    name="adminNote"
                    defaultValue={referral.adminNote}
                    placeholder="Example: Enrolment confirmed. I will update this after the first paid class."
                    className="mt-2 min-h-28 w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm"
                  />
                </label>
                <SubmitButton
                  pendingLabel="Saving referral..."
                  className="mt-4 w-full rounded-lg bg-accent px-4 py-3 font-bold text-bg-base"
                >
                  Save status and student update
                </SubmitButton>
              </form>
            </div>
          </article>
        );
      }) : (
        <div className="premium-card rounded-lg p-10 text-center">
          <Gift className="mx-auto h-8 w-8 text-accent" />
          <h2 className="mt-4 font-heading text-xl font-bold">No referral leads yet</h2>
          <p className="mt-2 text-text-secondary">New $100 Referral Bonus introductions will appear here.</p>
        </div>
      )}
    </div>
  );
}

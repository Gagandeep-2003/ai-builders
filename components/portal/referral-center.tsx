"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Gift, Send, Sparkles, UsersRound } from "lucide-react";
import { createReferralAction } from "@/app/actions/referrals";
import { SubmitButton } from "@/components/ui/submit-button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ReferralSubmission } from "@/lib/course-data";
import { formatDate } from "@/lib/utils";

export function ReferralCenter({ referrals }: { referrals: ReferralSubmission[] }) {
  const [state, action] = useActionState(createReferralAction, { ok: false, message: "" });

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-accent/25 bg-bg-card p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(110,231,183,0.17),transparent_35%),radial-gradient(circle_at_88%_20%,rgba(251,191,36,0.12),transparent_30%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent">
              <Gift className="h-3.5 w-3.5" />
              Learn together reward
            </div>
            <h1 className="mt-5 font-heading text-4xl font-extrabold">Bring a friend. Build more together.</h1>
            <p className="mt-4 max-w-2xl leading-7 text-text-secondary">
              Refer a sibling, friend, or classmate. When they enrol and complete their first session,
              both of you become eligible for two bonus skill-lab sessions.
            </p>
          </div>
          <motion.div
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="rounded-xl border border-accent/25 bg-accent/10 p-5 text-center">
              <p className="font-heading text-3xl font-bold text-accent">+2</p>
              <p className="mt-1 text-xs text-text-secondary">skill labs for you</p>
            </div>
            <div className="rounded-xl border border-amber-300/25 bg-amber-300/[0.07] p-5 text-center">
              <p className="font-heading text-3xl font-bold text-amber-200">+2</p>
              <p className="mt-1 text-xs text-text-secondary">skill labs for them</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <form action={action} className="premium-card rounded-xl p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <Send className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-xs uppercase text-accent">New referral</p>
              <h2 className="font-heading text-xl font-bold">Introduce someone</h2>
            </div>
          </div>

          {state.message ? (
            <div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
              state.ok
                ? "border-accent/30 bg-accent/10 text-accent"
                : "border-rose-400/35 bg-rose-500/10 text-rose-100"
            }`}>
              {state.message}
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="font-mono text-xs uppercase text-text-muted">Their name</span>
              <input name="referredName" required className="mt-2 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm outline-none focus:border-accent/60" />
            </label>
            <label className="block">
              <span className="font-mono text-xs uppercase text-text-muted">Email or phone</span>
              <input name="referredContact" required className="mt-2 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm outline-none focus:border-accent/60" />
            </label>
            <label className="block">
              <span className="font-mono text-xs uppercase text-text-muted">Relationship</span>
              <select name="relationship" required className="mt-2 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm outline-none focus:border-accent/60">
                <option value="">Choose one</option>
                <option>Friend</option>
                <option>Sibling</option>
                <option>Classmate</option>
                <option>Cousin</option>
                <option>Other</option>
              </select>
            </label>
            <label className="block">
              <span className="font-mono text-xs uppercase text-text-muted">Helpful note (optional)</span>
              <textarea name="note" className="mt-2 min-h-24 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm outline-none focus:border-accent/60" />
            </label>
          </div>
          <SubmitButton pendingLabel="Sending referral..." className="mt-5 w-full rounded-xl bg-accent px-5 py-3 font-bold text-bg-base">
            Send Referral
          </SubmitButton>
          <p className="mt-3 text-xs leading-5 text-text-muted">
            Share contact details only with their permission. Rewards are confirmed after enrolment and first-session completion.
          </p>
        </form>

        <div className="premium-card rounded-xl p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase text-accent">Referral journey</p>
              <h2 className="mt-1 font-heading text-xl font-bold">Your introductions</h2>
            </div>
            <span className="rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono text-xs text-text-muted">
              {referrals.length} total
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {referrals.length ? referrals.map((referral, index) => (
              <motion.article
                key={referral.id}
                className="rounded-xl border border-border/70 bg-white/[0.025] p-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                      <UsersRound className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-heading font-bold">{referral.referredName}</h3>
                      <p className="mt-1 text-xs text-text-muted">{referral.relationship} · sent {formatDate(referral.createdAt)}</p>
                    </div>
                  </div>
                  <StatusBadge status={referral.status} />
                </div>
                {referral.adminNote ? (
                  <p className="mt-3 rounded-lg border border-border/60 bg-bg-elevated px-3 py-2 text-sm text-text-secondary">
                    {referral.adminNote}
                  </p>
                ) : null}
              </motion.article>
            )) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <Sparkles className="mx-auto h-7 w-7 text-accent" />
                <h3 className="mt-3 font-heading font-bold">No referrals yet</h3>
                <p className="mt-2 text-sm text-text-secondary">Your referral status will appear here after you send one.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          ["1", "Introduce", "Send their name and contact with permission."],
          ["2", "Mentor connects", "Admin updates the status as the conversation progresses."],
          ["3", "Both unlock", "After enrolment and session one, both receive two skill labs."],
        ].map(([step, title, description]) => (
          <div key={step} className="premium-card rounded-xl p-5">
            <CheckCircle2 className="h-5 w-5 text-accent" />
            <p className="mt-4 font-mono text-xs uppercase text-text-muted">Step {step}</p>
            <h3 className="mt-1 font-heading text-lg font-bold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

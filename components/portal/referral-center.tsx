"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  CheckCircle2,
  Gift,
  HeartHandshake,
  Send,
  Sparkles,
  Star,
  Trophy,
  UsersRound,
} from "lucide-react";
import { createReferralAction } from "@/app/actions/referrals";
import { SubmitButton } from "@/components/ui/submit-button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ReferralSubmission } from "@/lib/course-data";
import { formatDate } from "@/lib/utils";

const rewardCards = [
  {
    value: "+4",
    label: "mastery sessions for you",
    description: "Use them for projects, missed concepts, interview-style practice, or extra AI build reviews.",
    tone: "accent",
  },
  {
    value: "+2",
    label: "starter boosters for them",
    description: "Your friend, sibling, cousin, or classmate gets extra support after joining.",
    tone: "warm",
  },
  {
    value: "Priority",
    label: "project review",
    description: "Successful referrals are flagged for mentor follow-up so rewards are not missed.",
    tone: "info",
  },
] as const;

const inviteIdeas = [
  ["Siblings or cousins", "Perfect if they like coding, AI tools, design, content, or building apps."],
  ["School friends", "Invite someone who keeps asking how you use ChatGPT, Canva, n8n, or app builders."],
  ["Parent network", "Parents can share the course with another family looking for structured AI learning."],
];

export function ReferralCenter({ referrals }: { referrals: ReferralSubmission[] }) {
  const [state, action] = useActionState(createReferralAction, { ok: false, message: "" });
  const successfulReferrals = referrals.filter((referral) => ["enrolled", "rewarded"].includes(referral.status)).length;
  const potentialBonusSessions = successfulReferrals * 4;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-accent/30 bg-bg-card p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(110,231,183,0.23),transparent_35%),radial-gradient(circle_at_86%_12%,rgba(251,191,36,0.19),transparent_32%),linear-gradient(135deg,rgba(110,231,183,0.08),transparent_45%,rgba(96,165,250,0.08))]" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full border border-accent/20 bg-accent/10 blur-2xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent">
              <Gift className="h-3.5 w-3.5" />
              Family and friends bonus
            </div>
            <h1 className="mt-5 max-w-3xl font-heading text-4xl font-extrabold leading-tight sm:text-5xl">
              Bring your circle into AI. Unlock extra mentor time.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">
              Refer a brother, sister, cousin, school friend, or family friend. When they enrol and finish
              their first live session, you become eligible for four bonus mastery sessions and they receive
              two welcome booster sessions.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
                Better projects
              </span>
              <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200">
                More 1:1 practice
              </span>
              <span className="rounded-full border border-info/25 bg-info/10 px-4 py-2 text-sm font-semibold text-[color:var(--info)]">
                Shared learning energy
              </span>
            </div>
          </div>
          <motion.div
            className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {rewardCards.map((card) => (
              <div
                key={card.label}
                className={
                  card.tone === "accent"
                    ? "rounded-xl border border-accent/30 bg-accent/10 p-5"
                    : card.tone === "warm"
                      ? "rounded-xl border border-amber-300/30 bg-amber-300/[0.08] p-5"
                      : "rounded-xl border border-info/25 bg-info/10 p-5"
                }
              >
                <p
                  className={
                    card.tone === "accent"
                      ? "font-heading text-4xl font-black text-accent"
                      : card.tone === "warm"
                        ? "font-heading text-4xl font-black text-amber-200"
                        : "font-heading text-3xl font-black text-[color:var(--info)]"
                  }
                >
                  {card.value}
                </p>
                <p className="mt-1 font-heading text-base font-bold">{card.label}</p>
                <p className="mt-2 text-xs leading-5 text-text-secondary">{card.description}</p>
              </div>
            ))}
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
              <h2 className="font-heading text-xl font-bold">Invite someone you know</h2>
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
              <input name="referredName" required placeholder="For example, Arjun Mehta" className="mt-2 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm outline-none focus:border-accent/60" />
            </label>
            <label className="block">
              <span className="font-mono text-xs uppercase text-text-muted">Email or phone</span>
              <input name="referredContact" required placeholder="Parent email, student email, or phone" className="mt-2 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm outline-none focus:border-accent/60" />
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
              <span className="font-mono text-xs uppercase text-text-muted">Why they may like it (optional)</span>
              <textarea name="note" placeholder="Example: Loves AI art, wants to build apps, needs help using AI for school, or wants a creative coding course." className="mt-2 min-h-24 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm outline-none focus:border-accent/60" />
            </label>
          </div>
          <SubmitButton pendingLabel="Sending referral..." className="mt-5 w-full rounded-xl bg-accent px-5 py-3 font-bold text-bg-base shadow-[0_14px_40px_rgba(110,231,183,0.22)]">
            Send Referral and Track Reward
          </SubmitButton>
          <p className="mt-3 text-xs leading-5 text-text-muted">
            Share contact details only with permission. Rewards are confirmed after enrolment and first-session completion.
          </p>
        </form>

        <div className="premium-card rounded-xl p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase text-accent">Referral journey</p>
              <h2 className="mt-1 font-heading text-xl font-bold">Your introductions</h2>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <span className="rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono text-xs text-text-muted">
                {referrals.length} total
              </span>
              <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
                {potentialBonusSessions} bonus sessions tracked
              </span>
            </div>
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
                <p className="mt-2 text-sm text-text-secondary">
                  Start with someone close: a sibling, cousin, classmate, or friend who would enjoy building with AI.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        {inviteIdeas.map(([title, description], index) => {
          const Icon = index === 0 ? HeartHandshake : index === 1 ? UsersRound : Star;
          return (
            <div key={title} className="premium-card rounded-xl p-5">
              <Icon className="h-5 w-5 text-accent" />
              <h3 className="mt-4 font-heading text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          ["1", "Introduce", "Send their details with permission. Your mentor follows up."],
          ["2", "They try the course", "They enrol and complete the first live AI Builders session."],
          ["3", "Rewards unlock", "You get four mastery sessions. They get two welcome boosters."],
        ].map(([step, title, description], index) => {
          const Icon = index === 2 ? Trophy : index === 1 ? BadgeCheck : CheckCircle2;
          return (
          <div key={step} className="premium-card rounded-xl p-5">
            <Icon className="h-5 w-5 text-accent" />
            <p className="mt-4 font-mono text-xs uppercase text-text-muted">Step {step}</p>
            <h3 className="mt-1 font-heading text-lg font-bold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
          </div>
          );
        })}
      </section>
    </div>
  );
}

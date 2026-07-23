"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleDollarSign,
  Clock3,
  Copy,
  Gift,
  HeartHandshake,
  Mail,
  MessageCircle,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { createReferralAction } from "@/app/actions/referrals";
import { replayReferralCampaign } from "@/components/portal/referral-campaign-launch";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ReferralStatus, ReferralSubmission } from "@/lib/course-data";
import { formatDate } from "@/lib/utils";

const shareMessage =
  "I am learning with AI Builders Academy and thought you might enjoy it too. The course has live, guided AI classes for building practical projects. New learners referred by a student receive 2 welcome booster sessions. If you would like details, I can connect you with my mentor.";

const statusDetails: Record<
  ReferralStatus,
  { label: string; tone: string; step: number; note: string }
> = {
  pending: {
    label: "Submitted",
    tone: "border-info/30 bg-info/10 text-[color:var(--info)]",
    step: 0,
    note: "Your mentor has received the introduction.",
  },
  contacted: {
    label: "Contacted",
    tone: "border-amber-300/30 bg-amber-300/10 text-amber-300",
    step: 1,
    note: "Your mentor is speaking with the referred family.",
  },
  enrolled: {
    label: "$100 due",
    tone: "border-accent/30 bg-accent/10 text-accent",
    step: 2,
    note: "Enrolment is confirmed. Payment unlocks after the first paid live class.",
  },
  rewarded: {
    label: "$100 paid",
    tone: "border-accent/40 bg-accent/15 text-accent",
    step: 3,
    note: "Your $100 referral bonus has been confirmed.",
  },
  closed: {
    label: "Closed",
    tone: "border-rose-400/30 bg-rose-400/10 text-rose-300",
    step: -1,
    note: "This introduction is no longer active.",
  },
};

const journeySteps = ["Submitted", "Contacted", "Enrolled", "$100 paid"];

const inviteIdeas = [
  ["Friend or classmate", "Someone curious about AI, creative work, coding, study systems, or building apps."],
  ["Sibling or cousin", "A family member who would benefit from guided, practical, one-to-one support."],
  ["Parent connection", "A family friend whose child is looking for structured, live AI learning."],
];

const eligibilityItems = [
  {
    Icon: ShieldCheck,
    title: "Who qualifies",
    description: "A genuinely new learner who has not enrolled in AI Builders before.",
  },
  {
    Icon: Clock3,
    title: "When it unlocks",
    description: "After enrolment and completion of the first paid live class.",
  },
  {
    Icon: Gift,
    title: "What they receive",
    description: "Two welcome booster sessions for extra setup and learning support.",
  },
] as const;

export function ReferralCenter({ referrals }: { referrals: ReferralSubmission[] }) {
  const [state, action] = useActionState(createReferralAction, { ok: false, message: "" });
  const [copied, setCopied] = useState(false);
  const reducedMotion = useReducedMotion();
  const paidReferrals = referrals.filter((referral) => referral.status === "rewarded").length;
  const dueReferrals = referrals.filter((referral) => referral.status === "enrolled").length;
  const shareBody = encodeURIComponent(shareMessage);

  const copyShareMessage = async () => {
    await navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const replayRewardReveal = () => {
    replayReferralCampaign();
  };

  return (
    <div className="space-y-8">
      <section className="referral-page-hero">
        <div className="referral-page-stripes" aria-hidden="true" />
        <div className="relative z-10 grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:px-12 lg:py-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.17em] text-white">
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
              New referral reward
            </div>
            <h1 className="mt-5 max-w-3xl font-heading text-[2rem] font-black leading-[1.08] text-white sm:text-5xl lg:text-6xl">
              $100 Referral Bonus
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Introduce someone you genuinely believe will benefit from AI Builders. When they enrol and
              complete their first paid live class, you receive a $100 USD cash bonus.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#refer-now"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 font-bold text-[#10221d] transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
              >
                Refer someone
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-white/30 bg-black/15 px-5 py-3 font-semibold text-white transition hover:bg-black/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
              >
                See how it works
              </a>
              <button
                type="button"
                onClick={replayRewardReveal}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-amber-200/45 bg-amber-300/15 px-5 py-3 font-semibold text-amber-50 transition hover:bg-amber-300/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100 sm:w-auto"
              >
                <Play className="h-4 w-4 fill-current" />
                Replay gold reveal
              </button>
            </div>
          </div>

          <motion.figure
            className="referral-gold-visual referral-gold-visual-page"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, rotate: -3, scale: 0.94 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/referral-gold-reward.webp"
              alt="A photorealistic solid-gold AI Builders $100 referral bonus card"
              fill
              priority
              sizes="(max-width: 767px) calc(100vw - 3rem), 320px"
              className="object-cover"
            />
          </motion.figure>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 border-y border-border/70 py-7">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["01", "Make the introduction", "Share the course or send their details with permission."],
            ["02", "They enrol and begin", "The referred learner completes their first paid live class."],
            ["03", "Your $100 is confirmed", "Your mentor verifies eligibility and records the cash reward as paid."],
          ].map(([number, title, description], index) => {
            const Icon = index === 0 ? UsersRound : index === 1 ? BadgeCheck : CircleDollarSign;
            return (
              <div key={number} className="grid grid-cols-[auto_1fr] gap-4 px-2 sm:px-4">
                <span className="grid h-11 w-11 place-items-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.15em] text-text-muted">Step {number}</p>
                  <h2 className="mt-1 font-heading text-lg font-bold">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="premium-card rounded-lg p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-accent">Share kit</p>
              <h2 className="font-heading text-xl font-bold">Start the conversation</h2>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-text-secondary">
            Use this parent-friendly message as written, or personalize it before sharing.
          </p>
          <div className="mt-4 rounded-lg border border-border bg-bg-elevated p-4 text-sm leading-6 text-text-secondary">
            {shareMessage}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={copyShareMessage}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-bg-elevated px-4 py-2 text-sm font-semibold transition hover:border-accent/50 hover:text-accent"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <a
              href={`https://wa.me/?text=${shareBody}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-bg-elevated px-4 py-2 text-sm font-semibold transition hover:border-accent/50 hover:text-accent"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent("AI Builders Academy invitation")}&body=${shareBody}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-bg-elevated px-4 py-2 text-sm font-semibold transition hover:border-accent/50 hover:text-accent"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
          </div>
          <div className="mt-6 border-t border-border/70 pt-5">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.15em] text-text-muted">Good people to invite</p>
            <div className="mt-4 space-y-4">
              {inviteIdeas.map(([title, description], index) => {
                const Icon = index === 0 ? UsersRound : index === 1 ? HeartHandshake : ShieldCheck;
                return (
                  <div key={title} className="flex gap-3">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <div>
                      <p className="text-sm font-bold">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-text-secondary">{description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <form id="refer-now" action={action} className="premium-card scroll-mt-24 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg border border-amber-300/30 bg-amber-300/10 text-amber-300">
              <Send className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-amber-300">Claim path starts here</p>
              <h2 className="font-heading text-xl font-bold">Introduce a new learner</h2>
            </div>
          </div>

          {state.message ? (
            <div className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
              state.ok
                ? "border-accent/30 bg-accent/10 text-accent"
                : "border-rose-400/35 bg-rose-500/10 text-rose-200"
            }`}>
              {state.message}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-mono text-xs uppercase text-text-muted">Their name</span>
              <input
                name="referredName"
                required
                placeholder="For example, Arjun Mehta"
                className="mt-2 w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm outline-none focus:border-accent/60"
              />
            </label>
            <label className="block">
              <span className="font-mono text-xs uppercase text-text-muted">Email or phone</span>
              <input
                name="referredContact"
                required
                placeholder="Parent email or phone"
                className="mt-2 w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm outline-none focus:border-accent/60"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="font-mono text-xs uppercase text-text-muted">Relationship</span>
              <select
                name="relationship"
                required
                className="mt-2 w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm outline-none focus:border-accent/60"
              >
                <option value="">Choose one</option>
                <option>Friend</option>
                <option>Sibling</option>
                <option>Classmate</option>
                <option>Cousin</option>
                <option>Family friend</option>
                <option>Other</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="font-mono text-xs uppercase text-text-muted">Helpful context (optional)</span>
              <textarea
                name="note"
                placeholder="What are they interested in, and why might AI Builders help them?"
                className="mt-2 min-h-24 w-full rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm outline-none focus:border-accent/60"
              />
            </label>
          </div>
          <SubmitButton
            pendingLabel="Submitting introduction..."
            className="mt-5 w-full rounded-lg bg-accent px-5 py-3 font-bold text-bg-base shadow-[0_14px_35px_rgba(110,231,183,0.18)]"
          >
            Submit and track my $100 reward
          </SubmitButton>
          <p className="mt-3 text-xs leading-5 text-text-muted">
            Share contact details only with permission. One reward is available per unique new learner and is manually confirmed after their first paid live class.
          </p>
        </form>
      </section>

      <section className="premium-card rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-accent">Reward tracker</p>
            <h2 className="mt-1 font-heading text-2xl font-bold">Your introductions</h2>
            <p className="mt-2 text-sm text-text-secondary">Follow each referral from introduction through payment.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-border bg-bg-elevated px-3 py-1.5 font-mono text-xs text-text-muted">
              {referrals.length} submitted
            </span>
            <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 font-mono text-xs text-amber-300">
              {dueReferrals} awaiting payout
            </span>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-mono text-xs text-accent">
              ${paidReferrals * 100} paid
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {referrals.length ? referrals.map((referral, index) => {
            const status = statusDetails[referral.status];
            return (
              <motion.article
                key={referral.id}
                className="rounded-lg border border-border/70 bg-white/[0.025] p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.24) }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                      <UsersRound className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-heading font-bold">{referral.referredName}</h3>
                      <p className="mt-1 text-xs text-text-muted">
                        {referral.relationship} · submitted {formatDate(referral.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full border px-3 py-1 font-mono text-[0.68rem] uppercase ${status.tone}`}>
                    {status.label}
                  </span>
                </div>

                {referral.status !== "closed" ? (
                  <div className="mt-5 grid grid-cols-4 gap-2" aria-label={`Referral progress: ${status.label}`}>
                    {journeySteps.map((step, stepIndex) => {
                      const completed = stepIndex <= status.step;
                      return (
                        <div key={step} className="min-w-0">
                          <div className={`h-1.5 rounded-full ${completed ? "bg-accent" : "bg-border"}`} />
                          <p className={`mt-2 truncate font-mono text-[0.62rem] uppercase ${completed ? "text-accent" : "text-text-muted"}`}>
                            {step}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                <p className="mt-4 text-sm leading-6 text-text-secondary">{referral.adminNote || status.note}</p>
              </motion.article>
            );
          }) : (
            <div className="rounded-lg border border-dashed border-border p-10 text-center">
              <WalletCards className="mx-auto h-8 w-8 text-accent" />
              <h3 className="mt-4 font-heading text-lg font-bold">Your first $100 opportunity starts here</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-text-secondary">
                Think of one person who would genuinely enjoy guided AI learning, share the message above, and add their details when they are interested.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {eligibilityItems.map(({ Icon, title, description }) => (
          <div key={title} className="border-t border-border px-2 pt-5 sm:px-4">
            <Icon className="h-5 w-5 text-accent" />
            <h3 className="mt-4 font-heading text-lg font-bold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

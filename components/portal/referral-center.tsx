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
  Crown,
  Gem,
  Gift,
  HeartHandshake,
  Mail,
  MessageCircle,
  Play,
  ScrollText,
  Send,
  ShieldCheck,
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
    tone: "referral-ledger-status is-pending",
    step: 0,
    note: "Your mentor has received the introduction.",
  },
  contacted: {
    label: "Contacted",
    tone: "referral-ledger-status is-contacted",
    step: 1,
    note: "Your mentor is speaking with the referred family.",
  },
  enrolled: {
    label: "$100 due",
    tone: "referral-ledger-status is-due",
    step: 2,
    note: "Enrolment is confirmed. Payment unlocks after the first paid live class.",
  },
  rewarded: {
    label: "$100 paid",
    tone: "referral-ledger-status is-paid",
    step: 3,
    note: "Your $100 referral bonus has been confirmed.",
  },
  closed: {
    label: "Closed",
    tone: "referral-ledger-status is-closed",
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
    <div className="referral-vault space-y-8">
      <section className="referral-vault-hero">
        <div className="referral-vault-hero-art" aria-hidden="true" />
        <div className="referral-vault-hero-shade" aria-hidden="true" />
        <div className="referral-vault-hero-grid">
          <div className="referral-vault-hero-copy">
            <div className="referral-vault-eyebrow">
              <Crown className="h-4 w-4" />
              Private invitation reward
            </div>
            <h1 className="referral-vault-title">
              A golden introduction.
              <span>A $100 thank-you.</span>
            </h1>
            <p className="referral-vault-intro">
              Introduce someone you genuinely believe will benefit from AI Builders. When they enrol and
              complete their first paid live class, you receive a $100 USD cash bonus.
            </p>

            <dl className="referral-vault-highlights">
              <div>
                <dt>Your reward</dt>
                <dd>$100 cash</dd>
              </div>
              <div>
                <dt>Their welcome</dt>
                <dd>2 booster sessions</dd>
              </div>
              <div>
                <dt>What it takes</dt>
                <dd>1 warm introduction</dd>
              </div>
            </dl>

            <div className="referral-vault-actions">
              <a href="#refer-now" className="referral-vault-primary">
                Refer someone
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#how-it-works" className="referral-vault-secondary">
                See how it works
              </a>
              <button type="button" onClick={replayRewardReveal} className="referral-vault-replay">
                <Play className="h-4 w-4 fill-current" />
                Replay gold reveal
              </button>
            </div>
            <p className="referral-vault-verification">
              <BadgeCheck className="h-4 w-4" />
              Verified after the first paid live class
            </p>
          </div>

          <div className="referral-vault-card-stage">
            <motion.figure
              className="referral-vault-card"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateY: -8, y: 20, scale: 0.94 }}
              animate={{ opacity: 1, rotateY: 0, y: 0, scale: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src="/referral-gold-reward.webp"
                alt="A photorealistic solid-gold AI Builders $100 referral bonus card"
                fill
                priority
                sizes="(max-width: 767px) 260px, 320px"
                className="object-cover"
              />
              <span className="referral-vault-card-glint" aria-hidden="true" />
            </motion.figure>
            <div className="referral-vault-plaque">
              <Gem className="h-4 w-4" />
              AI Builders Referral Edition
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="referral-vault-contract scroll-mt-24">
        <div className="referral-vault-section-heading">
          <div>
            <p className="referral-vault-kicker">The reward contract</p>
            <h2>Three steps. No complicated points system.</h2>
          </div>
          <p>Every introduction is tracked from the moment you submit it.</p>
        </div>
        <div className="referral-vault-contract-grid">
          {[
            ["01", "Make the introduction", "Share the course or send their details with permission."],
            ["02", "They enrol and begin", "The referred learner completes their first paid live class."],
            ["03", "Receive your $100", "Your mentor verifies eligibility and records the cash reward as paid."],
          ].map(([number, title, description], index) => {
            const Icon = index === 0 ? UsersRound : index === 1 ? BadgeCheck : CircleDollarSign;
            return (
              <article key={number} className="referral-contract-step">
                <div className="referral-contract-marker">
                  <span>{number}</span>
                  <Icon className="h-5 w-5" />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="referral-vault-atelier">
        <div className="referral-vault-section-heading">
          <div>
            <p className="referral-vault-kicker">Invitation atelier</p>
            <h2>Make a thoughtful introduction.</h2>
          </div>
          <p>Start with the message, then add their details only when they are interested.</p>
        </div>

        <div className="referral-vault-atelier-grid">
          <div className="referral-vault-share">
            <div className="referral-vault-subheading">
              <span><MessageCircle className="h-5 w-5" /></span>
              <div>
                <p>Share kit</p>
                <h3>Start the conversation</h3>
              </div>
            </div>
            <blockquote className="referral-vault-message">
              <span aria-hidden="true">&ldquo;</span>
              {shareMessage}
            </blockquote>
            <div className="referral-vault-share-actions">
              <button type="button" onClick={copyShareMessage}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy message"}
              </button>
              <a href={`https://wa.me/?text=${shareBody}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a href={`mailto:?subject=${encodeURIComponent("AI Builders Academy invitation")}&body=${shareBody}`}>
                <Mail className="h-4 w-4" />
                Email
              </a>
            </div>

            <div className="referral-vault-invite-list">
              <p className="referral-vault-kicker">People worth inviting</p>
              {inviteIdeas.map(([title, description], index) => {
                const Icon = index === 0 ? UsersRound : index === 1 ? HeartHandshake : ShieldCheck;
                return (
                  <div key={title}>
                    <Icon className="h-4 w-4" />
                    <span>
                      <strong>{title}</strong>
                      <small>{description}</small>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <form id="refer-now" action={action} className="referral-vault-form scroll-mt-24">
            <div className="referral-vault-subheading">
              <span><Send className="h-5 w-5" /></span>
              <div>
                <p>Private introduction</p>
                <h3>Introduce a new learner</h3>
              </div>
            </div>

            {state.message ? (
              <div className={`referral-vault-form-state ${state.ok ? "is-success" : "is-error"}`}>
                {state.message}
              </div>
            ) : null}

            <div className="referral-vault-form-grid">
              <label>
                <span>Their name</span>
                <input name="referredName" required placeholder="For example, Arjun Mehta" />
              </label>
              <label>
                <span>Email or phone</span>
                <input name="referredContact" required placeholder="Parent email or phone" />
              </label>
              <label className="sm:col-span-2">
                <span>Relationship</span>
                <select name="relationship" required>
                  <option value="">Choose one</option>
                  <option>Friend</option>
                  <option>Sibling</option>
                  <option>Classmate</option>
                  <option>Cousin</option>
                  <option>Family friend</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="sm:col-span-2">
                <span>Helpful context (optional)</span>
                <textarea
                  name="note"
                  placeholder="What are they interested in, and why might AI Builders help them?"
                />
              </label>
            </div>
            <SubmitButton pendingLabel="Submitting introduction..." className="referral-vault-submit">
              Submit and track my $100 reward
            </SubmitButton>
            <p className="referral-vault-consent">
              Share contact details only with permission. One reward is available per unique new learner and is
              manually confirmed after their first paid live class.
            </p>
          </form>
        </div>
      </section>

      <section className="referral-vault-ledger">
        <div className="referral-vault-ledger-heading">
          <div className="referral-vault-subheading">
            <span><ScrollText className="h-5 w-5" /></span>
            <div>
              <p>Reward ledger</p>
              <h2>Your introductions</h2>
            </div>
          </div>
          <div className="referral-vault-ledger-totals">
            <span><strong>{referrals.length}</strong> submitted</span>
            <span><strong>{dueReferrals}</strong> awaiting payout</span>
            <span><strong>${paidReferrals * 100}</strong> paid</span>
          </div>
        </div>

        <div className="referral-vault-ledger-list">
          {referrals.length ? referrals.map((referral, index) => {
            const status = statusDetails[referral.status];
            return (
              <motion.article
                key={referral.id}
                className="referral-ledger-entry"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reducedMotion ? 0 : Math.min(index * 0.04, 0.24) }}
              >
                <div className="referral-ledger-entry-top">
                  <div className="referral-ledger-person">
                    <span><UsersRound className="h-4 w-4" /></span>
                    <div>
                      <h3>{referral.referredName}</h3>
                      <p>{referral.relationship} · submitted {formatDate(referral.createdAt)}</p>
                    </div>
                  </div>
                  <span className={status.tone}>{status.label}</span>
                </div>

                {referral.status !== "closed" ? (
                  <div className="referral-ledger-progress" aria-label={`Referral progress: ${status.label}`}>
                    {journeySteps.map((step, stepIndex) => {
                      const completed = stepIndex <= status.step;
                      return (
                        <div key={step}>
                          <span className={completed ? "is-complete" : ""} />
                          <p className={completed ? "is-complete" : ""}>{step}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                <p className="referral-ledger-note">{referral.adminNote || status.note}</p>
              </motion.article>
            );
          }) : (
            <div className="referral-vault-empty">
              <WalletCards className="h-9 w-9" />
              <h3>Your first $100 opportunity starts here</h3>
              <p>
                Think of one person who would genuinely enjoy guided AI learning, share the message above, and
                add their details when they are interested.
              </p>
              <a href="#refer-now">Make an introduction <ArrowRight className="h-4 w-4" /></a>
            </div>
          )}
        </div>
      </section>

      <section className="referral-vault-terms">
        <div>
          <p className="referral-vault-kicker">The fine print, made clear</p>
          <h2>A reward built on genuine introductions.</h2>
        </div>
        <div className="referral-vault-terms-grid">
          {eligibilityItems.map(({ Icon, title, description }, index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <Icon className="h-5 w-5" />
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

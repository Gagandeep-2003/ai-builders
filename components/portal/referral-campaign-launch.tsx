"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Gift, UsersRound, X } from "lucide-react";

const CAMPAIGN_VERSION = "100-dollar-referral-v2";
const CAMPAIGN_INTERVAL_MS = 24 * 60 * 60 * 1000;
const subscribeToBrowser = () => () => {};

export const REFERRAL_CAMPAIGN_REPLAY_EVENT = "ai-builders:replay-referral-campaign";

declare global {
  interface Window {
    __openReferralCampaign?: () => void;
  }
}

export function replayReferralCampaign() {
  if (typeof window === "undefined") return;

  if (window.__openReferralCampaign) {
    window.__openReferralCampaign();
    return;
  }

  window.dispatchEvent(new Event(REFERRAL_CAMPAIGN_REPLAY_EVENT));
}

const goldSparks = Array.from({ length: 8 }, (_, index) => index);

export function ReferralCampaignLaunch({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const mounted = useSyncExternalStore(subscribeToBrowser, () => true, () => false);
  const [open, setOpen] = useState(false);
  const [revealKey, setRevealKey] = useState(0);

  const storageKey = `ai-builders:${CAMPAIGN_VERSION}:${studentId}`;

  const showCampaign = useCallback(
    ({ automatic = false }: { automatic?: boolean } = {}) => {
      if (automatic) {
        window.localStorage.setItem(storageKey, Date.now().toString());
      }
      setRevealKey((current) => current + 1);
      setOpen(true);
    },
    [storageKey],
  );

  const dismiss = useCallback(() => {
    setOpen(false);
  }, []);

  const viewReward = useCallback(() => {
    setOpen(false);
    router.push("/referrals");
  }, [router]);

  useEffect(() => {
    const lastShown = Number(window.localStorage.getItem(storageKey));
    const elapsed = Number.isFinite(lastShown) ? Date.now() - lastShown : CAMPAIGN_INTERVAL_MS;
    const delay = Math.max(550, CAMPAIGN_INTERVAL_MS - elapsed);

    const timer = window.setTimeout(() => showCampaign({ automatic: true }), delay);
    return () => window.clearTimeout(timer);
  }, [showCampaign, storageKey]);

  useEffect(() => {
    const replay = () => showCampaign();
    window.addEventListener(REFERRAL_CAMPAIGN_REPLAY_EVENT, replay);
    window.__openReferralCampaign = replay;

    return () => {
      window.removeEventListener(REFERRAL_CAMPAIGN_REPLAY_EVENT, replay);
      if (window.__openReferralCampaign === replay) {
        delete window.__openReferralCampaign;
      }
    };
  }, [showCampaign]);

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [dismiss, open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="referral-launch-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.22 }}
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) dismiss();
          }}
        >
          {!reducedMotion ? (
            <div key={`reveal-${revealKey}`} className="referral-launch-reveal" aria-hidden="true">
              <span className="referral-launch-halo" />
              {goldSparks.map((index) => (
                <span key={index} className={`referral-launch-spark spark-${index + 1}`} />
              ))}
            </div>
          ) : null}

          <motion.section
            ref={dialogRef}
            className="referral-launch-ticket"
            role="dialog"
            aria-modal="true"
            aria-labelledby="referral-campaign-title"
            aria-describedby="referral-campaign-description"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: reducedMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={dismiss}
              className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-black/25 text-white/80 transition hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Close referral reward announcement"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="referral-launch-grid relative z-10 grid md:grid-cols-[0.8fr_1.2fr]">
              <div className="referral-launch-award">
                <div className="referral-launch-gold-burst" aria-hidden="true" />
                <motion.div
                  key={`card-${revealKey}`}
                  className="referral-launch-award-card"
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -36, rotate: -5, scale: 0.82 }}
                  animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                  transition={{ duration: reducedMotion ? 0 : 0.78, delay: reducedMotion ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image
                    src="/referral-gold-reward.webp"
                    alt="A photorealistic solid-gold AI Builders $100 referral bonus card"
                    fill
                    priority
                    sizes="(max-width: 767px) calc(100vw - 2rem), 368px"
                    className="object-cover"
                  />
                  <span className="referral-launch-card-glint" aria-hidden="true" />
                </motion.div>
              </div>

              <div className="flex flex-col justify-center bg-[color:var(--bg-card)] px-6 py-14 sm:px-10">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                  Hi {studentName.split(" ")[0]}, this is new
                </span>
                <h2
                  id="referral-campaign-title"
                  className="mt-4 max-w-xl font-heading text-3xl font-black leading-tight sm:text-4xl"
                >
                  Your next successful referral is worth $100.
                </h2>
                <p
                  id="referral-campaign-description"
                  className="mt-4 max-w-xl text-sm leading-6 text-text-secondary sm:text-base"
                >
                  Introduce a friend or family member to AI Builders. When they enrol and complete their
                  first paid live class, you receive a $100 cash bonus.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-accent/30 bg-accent/10 p-4">
                    <Gift className="h-5 w-5 text-accent" />
                    <p className="mt-3 font-heading font-bold">You receive $100</p>
                    <p className="mt-1 text-xs leading-5 text-text-secondary">Cash bonus after eligibility is confirmed.</p>
                  </div>
                  <div className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-4">
                    <UsersRound className="h-5 w-5 text-amber-300" />
                    <p className="mt-3 font-heading font-bold">They receive 2 boosters</p>
                    <p className="mt-1 text-xs leading-5 text-text-secondary">Two welcome support sessions after joining.</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={viewReward}
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 font-bold text-bg-base transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    View the $100 reward
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="min-h-12 rounded-lg border border-border bg-bg-elevated px-5 py-3 font-semibold text-text-secondary transition hover:border-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Not now
                  </button>
                </div>
                <p className="mt-4 text-xs leading-5 text-text-muted">
                  One reward per unique new learner. Your mentor confirms payment after the first paid live class.
                </p>
              </div>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

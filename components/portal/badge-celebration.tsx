"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { acknowledgeBadgeAction } from "@/app/actions/achievements";
import { BadgeMedallion } from "@/components/portal/badge-medallion";
import type { StudentBadge } from "@/lib/course-data";

export function BadgeCelebration({ award }: { award?: StudentBadge }) {
  const [visible, setVisible] = useState(false);
  const acknowledgementStarted = useRef(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!award || acknowledgementStarted.current) return;
    acknowledgementStarted.current = true;

    const storageKey = `ai-builders-achievement-seen:${award.id}`;
    let alreadyShown = false;
    try {
      alreadyShown = window.localStorage.getItem(storageKey) === "1";
    } catch {
      // Storage can be unavailable in strict privacy modes.
    }

    let revealTimer: number | undefined;
    if (!alreadyShown) {
      try {
        window.localStorage.setItem(storageKey, "1");
      } catch {
        // The database acknowledgement remains the source of truth.
      }
      revealTimer = window.setTimeout(() => setVisible(true), 0);
    }

    startTransition(async () => {
      const result = await acknowledgeBadgeAction(award.id);
      if (!result.ok) {
        console.error("Achievement acknowledgement will be retried on a future visit.");
      }
    });

    return () => {
      if (revealTimer !== undefined) window.clearTimeout(revealTimer);
    };
  }, [award]);

  function close() {
    setVisible(false);
  }

  if (!award) return null;
  const currentAward = award;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-bg-base/82 p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={`Badge earned: ${currentAward.definition.name}`}
        >
          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-bg-card p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
            initial={{ scale: 0.72, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 17 }}
          >
            <button onClick={close} className="absolute right-4 top-4 rounded-lg border border-border p-2 text-text-muted hover:text-text-primary" aria-label="Close badge celebration">
              <X className="h-4 w-4" />
            </button>
            <motion.div
              className="badge-rays pointer-events-none absolute left-1/2 top-[42%] h-80 w-80 -translate-x-1/2 -translate-y-1/2"
              style={{ color: currentAward.definition.color }}
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />
            <p className="relative font-mono text-xs uppercase text-accent">Achievement unlocked</p>
            <motion.div
              className="relative mx-auto mt-8 w-fit"
              initial={{ rotate: -12, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 14 }}
            >
              <BadgeMedallion badge={currentAward.definition} size="lg" />
            </motion.div>
            <h2 className="relative mt-7 font-heading text-3xl font-black">{currentAward.definition.name}</h2>
            <p className="relative mt-3 text-sm leading-6 text-text-secondary">{currentAward.definition.description}</p>
            {currentAward.mentorNote ? <p className="relative mt-4 rounded-xl border border-accent/20 bg-accent/5 p-3 text-sm text-text-primary">{currentAward.mentorNote}</p> : null}
            <button onClick={close} className="button-motion relative mt-7 w-full rounded-xl bg-accent px-5 py-3 font-bold text-bg-base">
              Add to achievement vault
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

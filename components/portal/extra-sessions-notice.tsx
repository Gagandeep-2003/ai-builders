"use client";

import { useCallback, useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarPlus, X } from "lucide-react";

const NOTICE_EXPIRES_AT = Date.parse("2026-11-07T00:00:00+05:30");
const DISMISS_EVENT = "ai-builders:extra-sessions-notice-dismissed";

function subscribeToExpiry(callback: () => void) {
  const remaining = NOTICE_EXPIRES_AT - Date.now();
  if (remaining <= 0) return () => {};

  const timer = window.setTimeout(callback, remaining);
  return () => window.clearTimeout(timer);
}

export function ExtraSessionsNotice({ studentId }: { studentId: string }) {
  const reducedMotion = useReducedMotion();
  const storageKey = `ai-builders:extra-sessions-notice:${studentId}`;

  const subscribeToDismissal = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    window.addEventListener(DISMISS_EVENT, callback);
    return () => {
      window.removeEventListener("storage", callback);
      window.removeEventListener(DISMISS_EVENT, callback);
    };
  }, []);
  const getPopupSnapshot = useCallback(
    () => window.localStorage.getItem(storageKey) !== "dismissed",
    [storageKey],
  );
  const isActive = useSyncExternalStore(
    subscribeToExpiry,
    () => Date.now() < NOTICE_EXPIRES_AT,
    () => false,
  );
  const showPopup = useSyncExternalStore(subscribeToDismissal, getPopupSnapshot, () => false);

  function dismissPopup() {
    window.localStorage.setItem(storageKey, "dismissed");
    window.dispatchEvent(new Event(DISMISS_EVENT));
  }

  if (!isActive) return null;

  return (
    <>
      {showPopup ? (
        <motion.aside
          role="status"
          aria-live="polite"
          aria-label="Extra sessions profile update"
          className="fixed right-4 top-4 z-[80] w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-2xl border border-accent/35 bg-bg-card p-5 shadow-[0_22px_70px_rgba(0,0,0,0.48),0_0_35px_rgba(110,231,183,0.14)] sm:right-6 sm:top-6"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(110,231,183,0.16),transparent_58%)]" />
          <div className="relative flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
              <CalendarPlus className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1 pr-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">Profile update</p>
              <p className="mt-2 font-heading text-lg font-bold leading-snug text-text-primary">
                4 extra sessions added under your profile.
              </p>
            </div>
            <button
              type="button"
              onClick={dismissPopup}
              className="absolute -right-1 -top-1 grid h-9 w-9 place-items-center rounded-lg border border-border bg-bg-elevated text-text-secondary transition hover:border-accent/40 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close extra sessions message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.aside>
      ) : null}

      <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-accent/[0.07] px-4 py-3 shadow-[0_0_28px_rgba(110,231,183,0.08)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(110,231,183,0.08),transparent)]" />
        <div className="relative flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
            <CalendarPlus className="h-4 w-4" />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">Profile update</p>
            <p className="mt-0.5 text-sm font-semibold text-text-primary">
              4 extra sessions added under your profile
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ArrowRight, MousePointer2, X } from "lucide-react";
import { useCallback, useEffect, useState, type CSSProperties } from "react";

const SplashCursor = dynamic(() => import("@/components/ui/splash-cursor"), {
  ssr: false,
});

type TourStep = "quick-chat" | "fluid-toggle";

type TargetPosition = {
  spotlight: CSSProperties;
  card: CSSProperties;
  side: "right" | "below" | "above";
};

function getTargetPosition(step: TourStep): TargetPosition | null {
  const target = document.querySelector<HTMLElement>(`[data-cursor-tour="${step}"]`);
  if (!target) return null;
  const rect = target.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;

  const gap = 18;
  const cardWidth = Math.min(340, window.innerWidth - 32);
  const cardHeight = step === "fluid-toggle" ? 390 : 330;
  const canPlaceRight = rect.right + gap + cardWidth <= window.innerWidth - 16;
  const canPlaceBelow = rect.bottom + gap + cardHeight <= window.innerHeight - 16;
  const left = canPlaceRight
    ? rect.right + gap
    : Math.min(window.innerWidth - cardWidth - 16, Math.max(16, rect.right - cardWidth));
  const top = canPlaceRight
    ? Math.max(16, Math.min(window.innerHeight - cardHeight - 16, rect.top + rect.height / 2 - cardHeight / 2))
    : canPlaceBelow
      ? rect.bottom + gap
      : Math.max(16, rect.top - gap - cardHeight);

  return {
    spotlight: {
      left: rect.left - 6,
      top: rect.top - 6,
      width: rect.width + 12,
      height: rect.height + 12,
    },
    card: { left, top, width: cardWidth },
    side: canPlaceRight ? "right" : canPlaceBelow ? "below" : "above",
  };
}

function CursorOnboarding({
  onComplete,
  onDismiss,
}: {
  onComplete: () => void;
  onDismiss: () => void;
}) {
  const [step, setStep] = useState<TourStep>("quick-chat");
  const [position, setPosition] = useState<TargetPosition | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const confirmed = confirmation.trim().toLowerCase() === "confirm";

  const updatePosition = useCallback(() => {
    const next = getTargetPosition(step);
    if (next) {
      setPosition(next);
      return;
    }

    if (step === "quick-chat") {
      window.dispatchEvent(new Event("portal:open-quick-chat"));
      setStep("fluid-toggle");
    }
  }, [step]);

  useEffect(() => {
    const timer = window.setTimeout(updatePosition, step === "fluid-toggle" ? 220 : 60);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
    };
  }, [step, updatePosition]);

  function showControl() {
    window.dispatchEvent(new Event("portal:open-quick-chat"));
    setPosition(null);
    setStep("fluid-toggle");
  }

  if (!position) return null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Fluid cursor introduction">
      <div className="absolute inset-0 bg-bg-base/58 backdrop-blur-[2px]" />
      <div
        className="pointer-events-none fixed rounded-2xl border-2 border-accent shadow-[0_0_0_5px_rgba(110,231,183,0.14),0_0_42px_rgba(110,231,183,0.45)]"
        style={position.spotlight}
      />
      <section
        className="scrollbar-soft fixed max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-accent/30 bg-bg-card/95 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        style={position.card}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(168,85,247,0.17),transparent_38%),radial-gradient(circle_at_90%_22%,rgba(6,182,212,0.14),transparent_36%)]" />
        <button
          type="button"
          onClick={onDismiss}
          className="button-motion absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-lg border border-border bg-bg-elevated text-text-muted hover:text-text-primary"
          aria-label="Close fluid cursor introduction for now"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="relative pr-8">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
            <MousePointer2 className="h-5 w-5" />
          </span>
          <p className="mt-4 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent">
            New · fluid cursor
          </p>
          <h2 className="mt-2 font-heading text-xl font-bold text-text-primary">
            {step === "quick-chat" ? "You are in control" : "Turn the effect on or off"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {step === "quick-chat"
              ? "The colorful fluid trail is enabled automatically. Open Quick Chat anytime to change it."
              : "Use this Fluid cursor switch whenever you prefer the normal cursor. Your choice is remembered."}
          </p>
          {step === "quick-chat" ? (
            <button
              type="button"
              onClick={showControl}
              className="button-motion mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 font-heading text-sm font-bold text-bg-base"
            >
              Show me the control
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <form
              className="mt-5"
              onSubmit={(event) => {
                event.preventDefault();
                if (confirmed) onComplete();
              }}
            >
              <label className="block font-mono text-[0.62rem] uppercase tracking-[0.16em] text-text-muted" htmlFor="cursor-tour-confirmation">
                Type CONFIRM to finish
              </label>
              <input
                id="cursor-tour-confirmation"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder="CONFIRM"
                autoComplete="off"
                className="mt-2 h-11 w-full rounded-xl border border-border bg-bg-elevated px-3 font-mono text-sm uppercase text-text-primary outline-none transition focus:border-accent/60"
              />
              <button
                type="submit"
                disabled={!confirmed}
                className="button-motion mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 font-heading text-sm font-bold text-bg-base disabled:cursor-not-allowed disabled:opacity-40"
              >
                Finish introduction
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-2 text-xs leading-5 text-text-muted">
                Closing before confirmation will show this short guide again next time.
              </p>
            </form>
          )}
        </div>
        <span
          className={
            position.side === "right"
              ? "absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border-b border-l border-accent/30 bg-bg-card"
              : position.side === "below"
                ? "absolute -top-2 right-8 h-4 w-4 rotate-45 border-l border-t border-accent/30 bg-bg-card"
                : "absolute -bottom-2 right-8 h-4 w-4 rotate-45 border-b border-r border-accent/30 bg-bg-card"
          }
          aria-hidden="true"
        />
      </section>
    </div>
  );
}

export function StudentSplashCursor({ studentId }: { studentId: string }) {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const cursorPreferenceKey = `ai-builders-splash-cursor-enabled:${studentId}`;
  const cursorTourKey = `ai-builders-splash-cursor-tour-seen:${studentId}`;

  useEffect(() => {
    let tourTimer: number | undefined;
    const initialStateTimer = window.setTimeout(() => {
      const stored = window.localStorage.getItem(cursorPreferenceKey);
      setEnabled(stored !== "false");
      setReady(true);
      if (stored !== "false" && window.localStorage.getItem(cursorTourKey) !== "true") {
        tourTimer = window.setTimeout(() => setShowTour(true), 900);
      }
    }, 0);

    const handlePreference = (event: Event) => {
      const nextEnabled = (event as CustomEvent<{ enabled: boolean }>).detail?.enabled;
      if (typeof nextEnabled !== "boolean") return;
      window.localStorage.setItem(cursorPreferenceKey, String(nextEnabled));
      setEnabled(nextEnabled);
      window.dispatchEvent(
        new CustomEvent("portal:splash-cursor-state", { detail: { enabled: nextEnabled } }),
      );
    };

    window.addEventListener("portal:set-splash-cursor", handlePreference);
    return () => {
      window.clearTimeout(initialStateTimer);
      if (tourTimer) window.clearTimeout(tourTimer);
      window.removeEventListener("portal:set-splash-cursor", handlePreference);
    };
  }, [cursorPreferenceKey, cursorTourKey]);

  function completeTour() {
    window.localStorage.setItem(cursorTourKey, "true");
    setShowTour(false);
  }

  if (!ready || !enabled || pathname === "/league" || pathname.startsWith("/league/")) return null;

  return (
    <>
      <div className="student-splash-cursor" aria-hidden="true">
        <SplashCursor
          DENSITY_DISSIPATION={3.5}
          VELOCITY_DISSIPATION={2}
          PRESSURE={0.1}
          CURL={3}
          SPLAT_RADIUS={0.2}
          SPLAT_FORCE={6000}
          COLOR_UPDATE_SPEED={10}
          SHADING
          RAINBOW_MODE
          COLOR="#A855F7"
        />
      </div>
      {showTour ? (
        <CursorOnboarding onComplete={completeTour} onDismiss={() => setShowTour(false)} />
      ) : null}
    </>
  );
}

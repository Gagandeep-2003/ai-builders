"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, BrainCircuit, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const REMIND_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export function LevelTwoDiscovery({
  studentId,
  firstName,
}: {
  studentId: string;
  firstName: string;
}) {
  const reducedMotion = useReducedMotion();
  const [showModal, setShowModal] = useState(false);
  const primaryActionRef = useRef<HTMLAnchorElement>(null);
  const storageKey = `ai-builders:level-two-discovery:${studentId}`;

  useEffect(() => {
    let dismissedAt = 0;
    try {
      dismissedAt = Number(window.localStorage.getItem(storageKey) ?? 0);
    } catch {
      // The invitation can still be opened from the permanent dashboard card.
    }
    if (dismissedAt && Date.now() - dismissedAt < REMIND_AFTER_MS) return;

    const timer = window.setTimeout(() => setShowModal(true), reducedMotion ? 0 : 650);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, storageKey]);

  useEffect(() => {
    if (!showModal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    primaryActionRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  function remember() {
    try {
      window.localStorage.setItem(storageKey, String(Date.now()));
    } catch {
      // Storage is optional; navigation should never depend on it.
    }
  }

  function dismiss() {
    remember();
    setShowModal(false);
  }

  function openStory() {
    remember();
    setShowModal(false);
  }

  return (
    <>
      <section className="group relative overflow-hidden rounded-2xl border border-violet-300/25 bg-[linear-gradient(115deg,rgba(30,23,55,0.94),rgba(10,24,32,0.94))] p-5 shadow-[0_18px_60px_rgba(76,29,149,0.12)] sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl transition duration-700 group-hover:bg-violet-400/15" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-violet-300/25 bg-violet-300/10 text-violet-200 shadow-[0_0_30px_rgba(167,139,250,0.14)]">
              <BrainCircuit className="h-5 w-5" />
              <i className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">A new world has opened</p>
              <h2 className="mt-2 font-heading text-xl font-bold sm:text-2xl">Meet Agentic AI · Level 2</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                Go from asking AI for answers to building systems that remember, decide, use tools and improve.
              </p>
            </div>
          </div>
          <a
            href="/level-two-preview"
            target="_blank"
            rel="noopener noreferrer"
            onClick={openStory}
            className="button-motion inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-200/25 bg-violet-200/10 px-4 py-3 text-sm font-bold text-violet-100 transition hover:border-violet-200/45 hover:bg-violet-200/15"
          >
            Experience the story <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <AnimatePresence>
        {showModal ? (
          <motion.div
            className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-[#030409]/80 p-4 backdrop-blur-xl"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.24 }}
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) dismiss();
            }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="level-two-invitation-title"
              aria-describedby="level-two-invitation-copy"
              className="relative my-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-violet-200/25 bg-[linear-gradient(145deg,#151322,#090b12)] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.65),0_0_80px_rgba(139,92,246,0.13)] sm:p-10"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96 }}
              transition={{ duration: reducedMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

              <button
                type="button"
                onClick={dismiss}
                className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-text-secondary transition hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                aria-label="Close Level 2 invitation"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative">
                <motion.div
                  className="grid h-16 w-16 place-items-center rounded-2xl border border-violet-200/25 bg-violet-200/10 text-violet-100 shadow-[0_0_40px_rgba(167,139,250,0.18)]"
                  animate={reducedMotion ? undefined : { y: [0, -5, 0], rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="h-7 w-7" />
                </motion.div>
                <p className="mt-6 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-violet-200">Level 2 has arrived</p>
                <h2 id="level-two-invitation-title" className="mt-3 max-w-xl font-heading text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                  {firstName}, your AI story is about to change.
                </h2>
                <p id="level-two-invitation-copy" className="mt-5 max-w-xl text-base leading-7 text-text-secondary sm:text-lg">
                  You already know how to create with AI. Now discover how builders make AI remember, reason, use tools, make decisions and prove that it works.
                </p>

                <div className="mt-7 grid grid-cols-3 gap-2">
                  {[["3", "modules"], ["24", "sessions"], ["96", "missions"]].map(([value, label]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-center sm:p-4">
                      <strong className="block font-heading text-2xl text-white sm:text-3xl">{value}</strong>
                      <span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-text-muted sm:text-[10px]">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <a
                    ref={primaryActionRef}
                    href="/level-two-preview"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={openStory}
                    className="button-motion inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#c4b5fd,#67e8f9)] px-5 py-3.5 font-bold text-[#080a10] shadow-[0_14px_40px_rgba(103,232,249,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0c14]"
                  >
                    Begin the Level 2 story <ArrowRight className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3.5 text-sm font-bold text-text-secondary transition hover:border-white/20 hover:text-white"
                  >
                    Remind me later
                  </button>
                </div>
                <p className="mt-4 text-center text-xs text-text-muted">Opens an interactive story in a new tab. Nothing changes in your course automatically.</p>
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

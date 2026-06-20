"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Command,
  Palette,
  Pause,
  Play,
  Search,
  Sparkles,
  TimerReset,
  X,
} from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useTheme } from "@/components/ui/theme-provider";

const RippleGrid = dynamic(
  () => import("@/components/ui/ripple-grid").then((module) => module.RippleGrid),
  { ssr: false },
);
const Strands = dynamic(
  () => import("@/components/ui/strands").then((module) => module.Strands),
  { ssr: false },
);

export type StudentSearchItem = {
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  keywords: string[];
  priority?: number;
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function scoreItem(item: StudentSearchItem, query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 0;

  const terms = normalizedQuery.split(" ").filter(Boolean);
  const haystack = normalize([
    item.title,
    item.eyebrow,
    item.description,
    item.href,
    item.keywords.join(" "),
  ].join(" "));

  let score = item.priority ?? 0;
  for (const term of terms) {
    if (normalize(item.title).includes(term)) score += 14;
    if (normalize(item.eyebrow).includes(term)) score += 8;
    if (item.keywords.some((keyword) => normalize(keyword).includes(term))) score += 6;
    if (haystack.includes(term)) score += 3;
  }

  if (haystack.includes(normalizedQuery)) score += 20;
  return score;
}

function createAudioContext() {
  if (typeof window === "undefined") return;
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return;

  return new AudioContextCtor();
}

function playTugSound(context: AudioContext | null, kind: "pop" | "tick") {
  if (!context) return;
  void context.resume().catch(() => undefined);
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = kind === "tick" ? "triangle" : "sine";
  oscillator.frequency.setValueAtTime(kind === "tick" ? 1200 : 800, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    kind === "tick" ? 800 : 300,
    context.currentTime + (kind === "tick" ? 0.05 : 0.1),
  );
  gain.gain.setValueAtTime(kind === "tick" ? 0.1 : 0.5, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    kind === "tick" ? 0.001 : 0.01,
    context.currentTime + (kind === "tick" ? 0.05 : 0.15),
  );
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + (kind === "tick" ? 0.05 : 0.15));
}

function TugTimerSetup({
  getAudioContext,
  onStart,
}: {
  getAudioContext: () => AudioContext | null;
  onStart: (minutes: number) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const anchorRef = useRef({ x: 0, y: 0 });
  const previousMinuteRef = useRef(0);
  const selectedMinuteRef = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [snapScale, setSnapScale] = useState(1);
  const [snapKey, setSnapKey] = useState(0);

  const formatFutureTime = useCallback((minutes: number) => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  function renderLoop() {
    if (!draggingRef.current) return;
    currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.25;
    currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.25;
    const pullDistance = Math.max(0, currentRef.current.y - anchorRef.current.y);
    const minutes = Math.max(1, Math.min(60, Math.floor(pullDistance / 6)));
    if (minutes !== previousMinuteRef.current) {
      navigator.vibrate?.(10);
      playTugSound(getAudioContext(), "tick");
      previousMinuteRef.current = minutes;
      selectedMinuteRef.current = minutes;
      setSelectedMinutes(minutes);
    }
    setCurrentPoint({ ...currentRef.current });
    rafRef.current = requestAnimationFrame(renderLoop);
  }

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const stage = stageRef.current?.getBoundingClientRect();
    const face = faceRef.current?.getBoundingClientRect();
    if (!stage || !face) return;
    const anchor = {
      x: face.left - stage.left + face.width / 2,
      y: face.bottom - stage.top - 6,
    };
    anchorRef.current = anchor;
    targetRef.current = { x: event.clientX - stage.left, y: event.clientY - stage.top };
    currentRef.current = anchor;
    previousMinuteRef.current = 0;
    selectedMinuteRef.current = 0;
    setAnchorPoint(anchor);
    setCurrentPoint(anchor);
    setSelectedMinutes(0);
    draggingRef.current = true;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(renderLoop);
  }

  function updateTarget(event: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingRef.current || !stageRef.current) return;
    event.preventDefault();
    const stage = stageRef.current.getBoundingClientRect();
    targetRef.current = { x: event.clientX - stage.left, y: event.clientY - stage.top };
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const pullDistance = currentRef.current.y - anchorRef.current.y;
    setSnapScale(Math.max(1, Math.min(pullDistance / 20, 6)));
    setSnapKey((key) => key + 1);
    playTugSound(getAudioContext(), "pop");
    navigator.vibrate?.([30, 40, 30]);
    if (selectedMinuteRef.current > 0) onStart(selectedMinuteRef.current);
  }

  const pullDistance = Math.max(0, currentPoint.y - anchorPoint.y);
  const controlY = anchorPoint.y + pullDistance / 1.5;
  const path = dragging
    ? `M ${anchorPoint.x} ${anchorPoint.y} Q ${anchorPoint.x} ${controlY} ${currentPoint.x} ${currentPoint.y}`
    : "";

  return (
    <div className="overflow-hidden rounded-3xl border border-emerald-300/25 bg-[#f4f1eb] p-5 text-[#111] shadow-[0_24px_100px_rgba(30,179,108,0.12)]">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#1eb36c]">Tug timer</p>
        <h3 className="mt-2 font-heading text-2xl font-bold">Pull. Release. Done.</h3>
        <p className="mt-2 text-sm text-black/55">Drag the frog&apos;s tongue downward to choose your focus time.</p>
      </div>
      <div ref={stageRef} className="relative mt-5 h-[430px] w-full overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_10%,rgba(30,179,108,0.12),transparent_45%)]">
        <div className="absolute inset-x-0 top-0 flex h-9 items-center justify-end gap-3 rounded-b-xl bg-[#111] px-4 font-mono text-[0.6rem] font-semibold text-white/65">
          <span>FOCUS</span>
          <span>TUG TIMER</span>
        </div>
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <path d={path} stroke="#fb5498" strokeWidth="10" strokeLinecap="round" fill="none" />
          {dragging ? <circle cx={currentPoint.x} cy={currentPoint.y} r="8" fill="#fb5498" /> : null}
        </svg>
        <div
          ref={faceRef}
          onPointerDown={startDrag}
          onPointerMove={updateTarget}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="absolute right-4 top-0 flex h-9 w-10 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
        >
          <div className="relative mt-1 flex h-[22px] w-[26px] items-center justify-center rounded-[20px] bg-[#1eb36c]">
            <span className="absolute left-0.5 -top-1.5 h-[3px] w-2 rotate-[15deg] rounded-sm bg-[#1eb36c]" />
            <span className="absolute right-0.5 -top-1.5 h-[3px] w-2 -rotate-[15deg] rounded-sm bg-[#1eb36c]" />
            <div className="-mt-0.5 flex gap-0.5">
              {[0, 1].map((eye) => (
                <span key={eye} className="grid h-[11px] w-[11px] place-items-center rounded-full bg-white">
                  <span
                    className="h-[5px] w-[5px] rounded-full bg-black transition-transform duration-100"
                    style={{ transform: `translateY(${dragging ? 3 : 0}px)` }}
                  />
                </span>
              ))}
            </div>
            {!dragging ? (
              <motion.span
                key={snapKey}
                className="absolute -bottom-1.5 left-1/2 h-3 w-2.5 -translate-x-1/2 origin-top rounded-b-[10px] bg-[#fb5498]"
                initial={{ scaleY: snapScale }}
                animate={{ scaleY: [snapScale, 0.4, 1.3, 0.85, 1] }}
                transition={{ duration: 0.6, times: [0, 0.3, 0.55, 0.8, 1], ease: [0.34, 1.56, 0.64, 1] }}
              />
            ) : null}
          </div>
        </div>
        <AnimatePresence>
          {dragging ? (
            <motion.div
              className="pointer-events-none absolute rounded-full bg-[#111] px-4 py-2 text-sm font-semibold text-white shadow-xl"
              style={{ left: currentPoint.x + 15, top: currentPoint.y - 15 }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
            >
              {selectedMinutes} min • {formatFutureTime(selectedMinutes)}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function playResultTone(context: AudioContext | null, index: number, variant: "result" | "ready" = "result") {
  if (!context) return;
  void context.resume().catch(() => undefined);
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = variant === "ready" ? "triangle" : "sine";
  oscillator.frequency.value = variant === "ready" ? 660 : 520 + index * 42;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(variant === "ready" ? 0.045 : 0.034, context.currentTime + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.15);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.17);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export function StudentStrandsSearch({
  studentName,
}: {
  studentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<StudentSearchItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [timerSetupOpen, setTimerSetupOpen] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [focusTotalSeconds, setFocusTotalSeconds] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { theme } = useTheme();
  const firstName = studentName.split(" ")[0] || "Builder";
  const normalizedSubmittedQuery = normalize(submittedQuery);
  const isHelp = searched && ["/help", "help", "?"].includes(normalizedSubmittedQuery);
  const isThemeCommand =
    searched &&
    (normalizedSubmittedQuery === "toggle theme" ||
      normalizedSubmittedQuery === "theme" ||
      normalizedSubmittedQuery.includes("dark mode") ||
      normalizedSubmittedQuery.includes("light mode") ||
      (normalizedSubmittedQuery.includes("toggle") && normalizedSubmittedQuery.includes("theme")));
  const nextTheme = theme === "dark" ? "light" : "dark";
  const helpItems = [
    {
      title: "Find lessons and modules",
      description: "Try: module 1, session 4, ChatGPT, Canva, ethics, automation.",
    },
    {
      title: "Jump to work",
      description: "Try: homework, class challenge, home task, submitted, progress.",
    },
    {
      title: "Find live class info",
      description: "Try: next class, makeup class, schedule, resources, profile.",
    },
    {
      title: "Control appearance",
      description: "Try: toggle theme, light mode, or dark mode to switch the portal theme.",
    },
    {
      title: "Start a focus timer",
      description: "Open Tug Timer from Quick Actions and pull the frog's tongue to choose a duration.",
    },
  ];

  const results = useMemo(() => {
    if (
      !searched ||
      !submittedQuery.trim() ||
      isHelp ||
      isThemeCommand
    ) return [];
    return items
      .map((item) => ({ item, score: scoreItem(item, submittedQuery) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ item }) => item);
  }, [isHelp, isThemeCommand, items, searched, submittedQuery]);

  const ensureAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === "closed") {
      audioContextRef.current = createAudioContext() ?? null;
    }
    if (audioContextRef.current?.state === "suspended") {
      void audioContextRef.current.resume().catch(() => undefined);
    }
    return audioContextRef.current;
  }, []);

  const loadSearchItems = useCallback(async () => {
    if (items.length > 0 || loadingItems) return;
    setLoadingItems(true);
    try {
      const response = await fetch("/api/student-search");
      if (!response.ok) return;
      const payload = await response.json() as { items?: StudentSearchItem[] };
      setItems(payload.items ?? []);
    } finally {
      setLoadingItems(false);
    }
  }, [items.length, loadingItems]);

  const speakGreeting = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`Hi ${firstName}. What should we find today?`);
    utterance.rate = 1.03;
    utterance.pitch = 1.04;
    utterance.volume = 0.55;
    window.speechSynthesis.speak(utterance);
  }, [firstName]);

  const runQuery = useCallback((nextQuery: string) => {
    ensureAudioContext();
    playResultTone(audioContextRef.current, 0, "ready");
    setQuery(nextQuery);
    setSubmittedQuery(nextQuery);
    setSearched(false);
    window.setTimeout(() => setSearched(true), 520);
  }, [ensureAudioContext]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = event.code === "Space" && (event.altKey || event.ctrlKey);
      if (!shortcut) return;
      event.preventDefault();
      ensureAudioContext();
      setOpen((value) => {
        if (!value) void loadSearchItems();
        return !value;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ensureAudioContext, loadSearchItems]);

  useEffect(() => {
    if (!open) return;
    speakGreeting();
    const timer = window.setTimeout(() => inputRef.current?.focus(), 160);
    return () => window.clearTimeout(timer);
  }, [open, speakGreeting]);

  useEffect(() => {
    if (!searched || (results.length === 0 && !isHelp && !isThemeCommand)) return;
    const count = isHelp ? helpItems.length : isThemeCommand ? 1 : Math.min(results.length, 4);
    Array.from({ length: count }).forEach((_, index) => {
      window.setTimeout(() => playResultTone(audioContextRef.current, index), index * 95);
    });
  }, [helpItems.length, isHelp, isThemeCommand, results.length, searched]);

  useEffect(() => {
    if (!focusRunning) return;
    const timer = window.setInterval(() => {
      setFocusSeconds((seconds) => {
        if (seconds <= 1) {
          setFocusRunning(false);
          playTugSound(audioContextRef.current, "pop");
          window.setTimeout(() => playTugSound(audioContextRef.current, "pop"), 150);
          navigator.vibrate?.([100, 50, 100]);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [focusRunning]);

  function close() {
    setOpen(false);
    setQuery("");
    setSubmittedQuery("");
    setSearched(false);
    setTimerSetupOpen(false);
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const nextQuery = query.trim();
    if (!nextQuery) return;
    runQuery(nextQuery);
  }

  function startFocusTimer(minutes: number) {
    const boundedMinutes = Math.min(60, Math.max(1, Math.round(minutes)));
    ensureAudioContext();
    setFocusSeconds(boundedMinutes * 60);
    setFocusTotalSeconds(boundedMinutes * 60);
    setFocusRunning(true);
    setTimerSetupOpen(false);
    setOpen(false);
  }

  const focusMinutes = Math.floor(focusSeconds / 60);
  const focusRemainder = focusSeconds % 60;
  const focusLabel =
    `${String(focusMinutes).padStart(2, "0")}:${String(focusRemainder).padStart(2, "0")}`;

  return (
    <>
      <AnimatePresence>
        {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-bg-base/88 px-4 py-4 backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button className="absolute inset-0 cursor-default" aria-label="Close search" onClick={close} />
          <motion.section
            className="relative mx-auto flex max-h-[calc(100dvh-2rem)] min-h-[min(720px,calc(100dvh-2rem))] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-accent/20 bg-bg-card/90 shadow-[0_30px_120px_rgba(0,0,0,0.48)]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-45">
              <RippleGrid
                gridColor="#7C3AED"
                rippleIntensity={searched ? 0.07 : 0.045}
                gridSize={10}
                gridThickness={16}
                fadeDistance={1.55}
                vignetteStrength={2.35}
                glowIntensity={0.16}
                opacity={0.82}
                gridRotation={0}
                mouseInteraction
                mouseInteractionRadius={0.82}
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(249,115,22,0.13),transparent_34%),radial-gradient(circle_at_50%_36%,rgba(6,182,212,0.10),transparent_38%),linear-gradient(180deg,rgba(12,10,18,0.12),rgba(12,10,18,0.78))]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-90">
              <Strands
                colors={["#F97316", "#7C3AED", "#06B6D4"]}
                count={3}
                speed={searched ? 0.92 : 0.48}
                amplitude={searched ? 1.25 : 0.8}
                waviness={1.05}
                thickness={0.68}
                glow={3}
                taper={3.2}
                spread={1}
                intensity={searched ? 0.86 : 0.58}
                saturation={2}
                opacity={0.95}
                scale={1.45}
              />
            </div>
            <div className="relative z-10 flex shrink-0 items-center justify-between gap-4 border-b border-border/70 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-heading font-bold">Hi {firstName}, what should we find?</p>
                  <p className="text-xs text-text-muted">Press Option/Alt + Space or Ctrl + Space anytime.</p>
                </div>
              </div>
              <button
                onClick={close}
                className="button-motion grid h-10 w-10 place-items-center rounded-xl border border-border bg-bg-elevated text-text-secondary"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="scrollbar-soft relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6 md:px-8">
              <form onSubmit={submitSearch} className="mx-auto mt-20 w-full max-w-3xl">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-accent" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search lessons, homework, tools, resources, progress..."
                    className="w-full rounded-2xl border border-accent/25 bg-bg-base/84 py-5 pl-14 pr-16 font-heading text-xl font-bold text-text-primary outline-none shadow-[0_0_60px_rgba(110,231,183,0.11)] transition focus:border-accent/70"
                  />
                  <span className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-lg border border-border bg-bg-elevated px-2 py-1 font-mono text-[0.65rem] uppercase text-text-muted sm:inline-flex">
                    Enter
                  </span>
                </label>
              </form>

              <div className="mx-auto mt-8 w-full max-w-3xl">
                {!searched ? (
                  <>
                    {loadingItems ? (
                      <p className="mb-3 font-mono text-xs uppercase tracking-[0.16em] text-accent">
                        Preparing your course index...
                      </p>
                    ) : null}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={() => {
                          ensureAudioContext();
                          setTimerSetupOpen(true);
                          setSearched(true);
                        }}
                        className="group overflow-hidden rounded-2xl border border-pink-300/20 bg-[radial-gradient(circle_at_85%_0%,rgba(244,114,182,0.16),transparent_45%),rgba(255,255,255,0.025)] p-4 text-left transition hover:-translate-y-0.5 hover:border-pink-300/45"
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="font-heading font-bold text-text-primary">Pull Timer</span>
                          <TimerReset className="h-4 w-4 text-pink-300" />
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-text-secondary">
                          Pull the frog&apos;s elastic tongue. Every six pixels adds one minute; release to begin.
                        </span>
                      </button>
                      <button
                        onClick={() => runQuery("/help")}
                        className="group rounded-2xl border border-border bg-white/[0.025] p-4 text-left transition hover:-translate-y-0.5 hover:border-accent/35"
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="font-heading font-bold text-text-primary">What can I search?</span>
                          <Command className="h-4 w-4 text-accent" />
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-text-secondary">
                          See examples for finding sessions, homework, tools, classes, and resources.
                        </span>
                      </button>
                      <button
                        onClick={() => runQuery("next class")}
                        className="group rounded-2xl border border-border bg-white/[0.025] p-4 text-left transition hover:-translate-y-0.5 hover:border-accent/35"
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="font-heading font-bold text-text-primary">Find my next class</span>
                          <ArrowRight className="h-4 w-4 text-text-muted transition group-hover:translate-x-1 group-hover:text-accent" />
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-text-secondary">
                          Jump straight to class timing, Meet access, and schedule information.
                        </span>
                      </button>
                    </div>
                  </>
                ) : isHelp ? (
                  <div>
                    <motion.p
                      className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-accent"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Search powers
                    </motion.p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {helpItems.map((item, index) => (
                        <motion.div
                          key={item.title}
                          className="rounded-2xl border border-border bg-white/[0.025] p-4"
                          initial={{ opacity: 0, y: 18, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: index * 0.07, type: "spring", stiffness: 260, damping: 22 }}
                        >
                          <p className="font-heading font-bold">{item.title}</p>
                          <p className="mt-2 text-sm leading-6 text-text-secondary">{item.description}</p>
                        </motion.div>
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-text-muted">
                      Use natural words, exact session names, tools, module numbers, or portal areas.
                    </p>
                  </div>
                ) : timerSetupOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                  >
                    <TugTimerSetup getAudioContext={ensureAudioContext} onStart={startFocusTimer} />
                  </motion.div>
                ) : isThemeCommand ? (
                  <motion.div
                    className="overflow-hidden rounded-3xl border border-accent/25 bg-bg-base/80 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
                    initial={{ opacity: 0, y: 18, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  >
                    <div className="relative p-5 sm:p-6">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(249,115,22,0.14),transparent_34%),radial-gradient(circle_at_84%_30%,rgba(6,182,212,0.12),transparent_30%)]" />
                      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
                            <Palette className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                              Appearance command
                            </p>
                            <h3 className="mt-2 font-heading text-2xl font-bold">
                              Switch to {nextTheme} mode
                            </h3>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
                              Use the same circle reveal animation here, launched from the command center.
                            </p>
                          </div>
                        </div>
                        <AnimatedThemeToggler
                          variant="circle"
                          fromCenter
                          duration={680}
                          label={`Switch to ${nextTheme} mode`}
                          className="w-full shrink-0 sm:w-auto sm:min-w-60"
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : results.length > 0 ? (
                  <div>
                    <motion.p
                      className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-accent"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      Your results are ready
                    </motion.p>
                    <div className="space-y-3">
                      {results.map((result, index) => (
                        <motion.div
                          key={`${result.href}-${result.title}`}
                          initial={{ opacity: 0, y: 18, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: index * 0.06, type: "spring", stiffness: 260, damping: 22 }}
                        >
                          <Link
                            href={result.href}
                            onClick={close}
                            className="group flex items-start justify-between gap-4 rounded-2xl border border-border bg-white/[0.025] p-4 transition hover:border-accent/40 hover:bg-accent/5"
                          >
                            <div>
                              <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-accent">
                                {result.eyebrow}
                              </p>
                              <h3 className="mt-1 font-heading text-lg font-bold">{result.title}</h3>
                              <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{result.description}</p>
                            </div>
                            <ArrowRight className="mt-2 h-5 w-5 shrink-0 text-text-muted transition group-hover:translate-x-1 group-hover:text-accent" />
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <motion.div
                    className="rounded-2xl border border-border bg-white/[0.025] p-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="font-heading text-lg font-bold">I couldn&apos;t find that yet.</p>
                    <p className="mt-2 text-sm text-text-secondary">
                      Try searching for a session name, tool, homework title, resource, class, progress, or module number.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["ChatGPT", "home task", "Module 2", "resources", "progress"].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            runQuery(suggestion);
                          }}
                          className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs text-accent"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="relative z-10 flex shrink-0 items-center justify-between border-t border-border/70 px-5 py-3 text-xs text-text-muted">
              <span className="inline-flex items-center gap-2">
                <Command className="h-3.5 w-3.5" />
                Student search
              </span>
              <span>{loadingItems ? "Indexing..." : `${items.length} indexed portal items`}</span>
            </div>
          </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {focusSeconds > 0 ? (
          <motion.aside
            drag
            dragConstraints={{ top: -220, right: 24, bottom: 220, left: -280 }}
            dragElastic={0.06}
            dragMomentum={false}
            className="fixed bottom-5 right-5 z-[65] w-[min(21rem,calc(100vw-2rem))] touch-none sm:bottom-7 sm:right-7"
            initial={{ y: 28, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div className="relative cursor-grab overflow-hidden rounded-2xl border border-[#1eb36c]/30 bg-[#f4f1eb] p-4 text-[#111] shadow-[0_18px_60px_rgba(17,17,17,0.16),0_0_36px_rgba(30,179,108,0.12)] active:cursor-grabbing">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1eb36c] to-transparent" />
              <div className="flex items-center gap-3">
                <motion.div
                  className="relative grid h-14 w-[4.5rem] shrink-0 place-items-center rounded-[2rem] bg-[#1eb36c] shadow-[0_10px_24px_rgba(30,179,108,0.24)]"
                  animate={focusRunning ? { y: [0, -1.5, 0] } : { y: 0 }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  aria-hidden="true"
                >
                  <span className="absolute -left-0.5 -top-1 h-2 w-6 rotate-[15deg] rounded-full bg-[#1eb36c]" />
                  <span className="absolute -right-0.5 -top-1 h-2 w-6 -rotate-[15deg] rounded-full bg-[#1eb36c]" />
                  <span className="flex gap-1">
                    {[0, 1].map((eye) => (
                      <span key={eye} className="grid h-7 w-7 place-items-center rounded-full bg-white">
                        <span className="h-3 w-3 rounded-full bg-black" />
                      </span>
                    ))}
                  </span>
                  <motion.span
                    className="absolute -bottom-3 left-1/2 h-5 w-4 -translate-x-1/2 origin-top rounded-b-full bg-[#fb5498]"
                    animate={focusRunning ? { scaleY: [1, 1.14, 1] } : { scaleY: 0.72 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#1eb36c]">
                        Focus · Tug timer
                      </p>
                      <p className="mt-0.5 font-heading text-sm font-bold">
                        {focusRunning ? "Deep work in progress" : "Timer paused"}
                      </p>
                    </div>
                    <p className="font-mono text-2xl font-bold tabular-nums">{focusLabel}</p>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10">
                    <motion.div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#1eb36c_0%,#1eb36c_72%,#fb5498_100%)]"
                      animate={{ width: `${Math.max(2, Math.min(100, (focusSeconds / focusTotalSeconds) * 100))}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-1.5">
                  <button
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => setFocusRunning((running) => !running)}
                    className="button-motion grid h-8 w-8 place-items-center rounded-full bg-[#111] text-white"
                    aria-label={focusRunning ? "Pause focus timer" : "Resume focus timer"}
                  >
                    {focusRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => {
                      setFocusSeconds(0);
                      setFocusRunning(false);
                    }}
                    className="button-motion grid h-8 w-8 place-items-center rounded-full border border-black/10 bg-white/70 text-black/55"
                    aria-label="End focus timer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}

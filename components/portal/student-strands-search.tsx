"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Command,
  Gauge,
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

function playTimerSound(context: AudioContext | null, kind: "stretch" | "snap" | "tick") {
  if (!context) return;
  void context.resume().catch(() => undefined);
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  oscillator.type = kind === "tick" ? "square" : "sine";
  oscillator.frequency.setValueAtTime(
    kind === "stretch" ? 210 : kind === "snap" ? 620 : 92,
    context.currentTime,
  );
  oscillator.frequency.exponentialRampToValueAtTime(
    kind === "stretch" ? 320 : kind === "snap" ? 240 : 46,
    context.currentTime + 0.09,
  );
  filter.type = "lowpass";
  filter.frequency.value = kind === "tick" ? 520 : 1300;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(kind === "tick" ? 0.025 : 0.04, context.currentTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.12);
  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.13);
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
  const [timerSetupMode, setTimerSetupMode] = useState<"pull" | "dial" | null>(null);
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [dialRotation, setDialRotation] = useState(150);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [focusTotalSeconds, setFocusTotalSeconds] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusDockOpen, setFocusDockOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const dialDraggingRef = useRef(false);
  const lastTickMinuteRef = useRef(timerMinutes);
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
      description: "Choose Pull Timer or Dial Timer from Quick Actions. No command syntax needed.",
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
          playResultTone(audioContextRef.current, 0, "ready");
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
    setTimerSetupMode(null);
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const nextQuery = query.trim();
    if (!nextQuery) return;
    runQuery(nextQuery);
  }

  function startFocusTimer(minutes: number) {
    const boundedMinutes = Math.min(60, Math.max(5, Math.round(minutes / 5) * 5));
    ensureAudioContext();
    playTimerSound(audioContextRef.current, "snap");
    setTimerMinutes(boundedMinutes);
    setFocusSeconds(boundedMinutes * 60);
    setFocusTotalSeconds(boundedMinutes * 60);
    setFocusRunning(true);
    setFocusDockOpen(true);
    setTimerSetupMode(null);
    setOpen(false);
  }

  function handleTongueDrag(_: MouseEvent | TouchEvent | globalThis.PointerEvent, info: PanInfo) {
    const minutes = Math.min(60, Math.max(5, Math.round((5 + info.offset.y / 2.6) / 5) * 5));
    if (minutes !== timerMinutes) {
      setTimerMinutes(minutes);
      playTimerSound(audioContextRef.current, "stretch");
    }
  }

  function handleTongueRelease(_: MouseEvent | TouchEvent | globalThis.PointerEvent, info: PanInfo) {
    if (info.offset.y >= 18) startFocusTimer(timerMinutes);
  }

  function handleDialPointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dialDraggingRef.current || !dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const angle = (Math.atan2(
      event.clientY - (rect.top + rect.height / 2),
      event.clientX - (rect.left + rect.width / 2),
    ) * 180) / Math.PI + 90;
    const normalizedAngle = (angle + 360) % 360;
    const minutes = Math.min(60, Math.max(5, Math.round(normalizedAngle / 30) * 5 || 5));
    setDialRotation(minutes * 6);
    setTimerMinutes(minutes);
    if (minutes !== lastTickMinuteRef.current) {
      lastTickMinuteRef.current = minutes;
      playTimerSound(audioContextRef.current, "tick");
    }
  }

  function finishDial(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dialDraggingRef.current) return;
    dialDraggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
    startFocusTimer(timerMinutes);
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
                          setTimerMinutes(25);
                          setTimerSetupMode("pull");
                          setSearched(true);
                        }}
                        className="group overflow-hidden rounded-2xl border border-pink-300/20 bg-[radial-gradient(circle_at_85%_0%,rgba(244,114,182,0.16),transparent_45%),rgba(255,255,255,0.025)] p-4 text-left transition hover:-translate-y-0.5 hover:border-pink-300/45"
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="font-heading font-bold text-text-primary">Pull Timer</span>
                          <TimerReset className="h-4 w-4 text-pink-300" />
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-text-secondary">
                          Pull an elastic tab to choose the duration. Release it to begin.
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          ensureAudioContext();
                          setTimerMinutes(25);
                          setDialRotation(150);
                          setTimerSetupMode("dial");
                          setSearched(true);
                        }}
                        className="group overflow-hidden rounded-2xl border border-cyan-300/20 bg-[radial-gradient(circle_at_85%_0%,rgba(34,211,238,0.16),transparent_45%),rgba(255,255,255,0.025)] p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/45"
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="font-heading font-bold text-text-primary">Dial Timer</span>
                          <Gauge className="h-4 w-4 text-cyan-300" />
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-text-secondary">
                          Turn a weighted dial through five-minute steps. Release it to begin.
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
                ) : timerSetupMode === "pull" ? (
                  <motion.div
                    className="overflow-hidden rounded-3xl border border-pink-300/25 bg-bg-base/82 p-6 shadow-[0_24px_100px_rgba(244,114,182,0.12)]"
                    initial={{ opacity: 0, y: 18, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <p className="font-mono text-xs uppercase tracking-[0.2em] text-pink-200">Pull to focus</p>
                      <h3 className="mt-2 font-heading text-2xl font-bold">Choose time by stretching the tab</h3>
                      <div className="relative mt-8 h-64 w-full max-w-sm">
                        <div className="absolute left-1/2 top-0 -translate-x-1/2">
                          <div className="relative h-24 w-40 rounded-[3rem] border border-white/10 bg-[linear-gradient(145deg,#201638,#0f0c17)] shadow-[0_22px_70px_rgba(124,58,237,0.28)]">
                            <span className="absolute -left-1 top-2 h-5 w-12 -rotate-6 rounded-full bg-violet-400/70 blur-[1px]" />
                            <span className="absolute -right-1 top-2 h-5 w-12 rotate-6 rounded-full bg-cyan-300/65 blur-[1px]" />
                            <div className="absolute left-1/2 top-7 flex -translate-x-1/2 gap-3">
                              {[0, 1].map((eye) => (
                                <span key={eye} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-inner">
                                  <motion.span
                                    className="h-4 w-4 rounded-full bg-[#17111f]"
                                    animate={{ y: Math.min(7, timerMinutes / 10) }}
                                  />
                                </span>
                              ))}
                            </div>
                            <motion.button
                              drag="y"
                              dragConstraints={{ top: 0, bottom: 142 }}
                              dragElastic={0.12}
                              dragMomentum={false}
                              onDrag={handleTongueDrag}
                              onDragEnd={handleTongueRelease}
                              whileTap={{ scaleX: 1.08 }}
                              className="absolute left-1/2 top-[78px] h-14 w-12 -translate-x-1/2 cursor-grab rounded-b-[2rem] bg-[linear-gradient(180deg,#fb7185,#f472b6)] shadow-[0_12px_30px_rgba(244,114,182,0.45)] active:cursor-grabbing"
                              aria-label="Pull timer tab"
                            >
                              <span className="absolute inset-x-3 bottom-3 h-1 rounded-full bg-white/45" />
                            </motion.button>
                          </div>
                        </div>
                        <motion.div
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-2xl border border-pink-300/25 bg-pink-300/10 px-6 py-3 font-mono text-3xl font-bold tabular-nums text-pink-100"
                          animate={{ scale: [1, 1.035, 1] }}
                          transition={{ duration: 1.8, repeat: Infinity }}
                        >
                          {timerMinutes} min
                        </motion.div>
                      </div>
                      <p className="mt-4 text-sm text-text-secondary">Pull farther for more time. Release after pulling to start.</p>
                    </div>
                  </motion.div>
                ) : timerSetupMode === "dial" ? (
                  <motion.div
                    className="overflow-hidden rounded-3xl border border-cyan-300/25 bg-bg-base/82 p-6 shadow-[0_24px_100px_rgba(6,182,212,0.12)]"
                    initial={{ opacity: 0, y: 18, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-200">Weighted dial</p>
                      <h3 className="mt-2 font-heading text-2xl font-bold">Turn and release to begin</h3>
                      <div className="relative mt-7 grid h-72 w-72 place-items-center rounded-full border-[10px] border-black/35 bg-[linear-gradient(145deg,#25222e,#0a0910)] shadow-[20px_22px_70px_rgba(0,0,0,0.5),-12px_-12px_45px_rgba(124,58,237,0.12),inset_0_0_0_2px_rgba(255,255,255,0.05)]">
                        <span className="absolute top-2 z-30 h-0 w-0 border-x-[8px] border-b-[13px] border-x-transparent border-b-pink-400 drop-shadow-[0_0_7px_#f472b6]" />
                        <div
                          ref={dialRef}
                          onPointerDown={(event) => {
                            ensureAudioContext();
                            dialDraggingRef.current = true;
                            event.currentTarget.setPointerCapture(event.pointerId);
                            handleDialPointer(event);
                          }}
                          onPointerMove={handleDialPointer}
                          onPointerUp={finishDial}
                          onPointerCancel={() => {
                            dialDraggingRef.current = false;
                          }}
                          className="absolute h-60 w-60 cursor-grab touch-none rounded-full bg-[repeating-conic-gradient(from_0deg,#111018_0deg_3deg,transparent_3deg_8deg),conic-gradient(from_0deg,#17141f,#302943,#131119,#263544,#17141f)] shadow-[inset_0_0_26px_rgba(0,0,0,0.85),0_16px_30px_rgba(0,0,0,0.55)] active:cursor-grabbing"
                          style={{ transform: `rotate(${dialRotation}deg)` }}
                          role="slider"
                          aria-label="Focus timer minutes"
                          aria-valuemin={5}
                          aria-valuemax={60}
                          aria-valuenow={timerMinutes}
                        >
                          <span className="absolute left-1/2 top-4 h-7 w-1.5 -translate-x-1/2 rounded-full bg-cyan-200 shadow-[0_0_16px_#67e8f9]" />
                        </div>
                        <div className="pointer-events-none relative z-20 grid h-32 w-32 place-items-center rounded-full border border-white/10 bg-[#08070c] shadow-[inset_0_5px_16px_rgba(0,0,0,0.9),0_0_28px_rgba(6,182,212,0.12)]">
                          <div>
                            <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cyan-200">Minutes</p>
                            <p className="mt-1 font-mono text-4xl font-bold tabular-nums text-white">{timerMinutes}</p>
                          </div>
                        </div>
                      </div>
                      <p className="mt-5 text-sm text-text-secondary">Each soft click is five minutes. Release the dial to start.</p>
                    </div>
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
            drag="y"
            dragConstraints={{ top: -280, bottom: 280 }}
            dragElastic={0.08}
            dragMomentum={false}
            className="fixed right-0 top-[42%] z-[65] touch-none"
            initial={{ x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <svg className="absolute h-0 w-0" aria-hidden="true">
              <filter id="focus-dock-goo">
                <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10"
                  result="goo"
                />
                <feComposite in="SourceGraphic" in2="goo" operator="atop" />
              </filter>
            </svg>
            <div className="relative flex items-center pr-2" style={{ filter: "url(#focus-dock-goo)" }}>
              <motion.div
                className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[conic-gradient(from_90deg,#f97316,#7c3aed,#06b6d4,#f472b6,#f97316)] opacity-55 blur-xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                layout
                className="relative overflow-hidden rounded-l-3xl border border-r-0 border-white/15 bg-[#100d18]/95 shadow-[-18px_18px_70px_rgba(6,182,212,0.18)] backdrop-blur-2xl"
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(249,115,22,0.25),transparent_36%),radial-gradient(circle_at_10%_90%,rgba(6,182,212,0.22),transparent_40%),linear-gradient(120deg,rgba(124,58,237,0.16),transparent_55%)]" />
                <div className="relative flex items-stretch">
                  <button
                    onClick={() => setFocusDockOpen((value) => !value)}
                    className="group grid min-h-20 w-12 shrink-0 place-items-center border-r border-white/10 text-white"
                    aria-label={focusDockOpen ? "Collapse focus timer" : "Expand focus timer"}
                    title="Drag vertically or click to expand"
                  >
                    <span className="absolute left-1 top-2 h-2 w-2 rounded-full bg-orange-300 shadow-[0_0_16px_#fb923c]" />
                    {focusDockOpen
                      ? <ChevronRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                      : <ChevronLeft className="h-5 w-5 transition group-hover:-translate-x-0.5" />}
                    <span className="absolute bottom-2 left-1 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_#67e8f9]" />
                  </button>

                  <AnimatePresence initial={false}>
                    {focusDockOpen ? (
                      <motion.div
                        key="focus-expanded"
                        className="w-64 p-4 text-white"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 256, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-cyan-200">
                              Focus chamber
                            </p>
                            <p className="mt-1 font-mono text-3xl font-bold tabular-nums">{focusLabel}</p>
                          </div>
                          <span className={`mt-1 h-2.5 w-2.5 rounded-full ${
                            focusRunning
                              ? "animate-pulse bg-emerald-300 shadow-[0_0_18px_#6ee7b7]"
                              : "bg-white/35"
                          }`} />
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#f97316,#7c3aed,#06b6d4)] shadow-[0_0_16px_rgba(6,182,212,0.8)]"
                            animate={{ width: `${Math.max(4, Math.min(100, (focusSeconds / focusTotalSeconds) * 100))}%` }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                          />
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => setFocusRunning((running) => !running)}
                            className="button-motion inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-950"
                          >
                            {focusRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                            {focusRunning ? "Pause" : "Resume"}
                          </button>
                          <button
                            onClick={() => {
                              setFocusSeconds(0);
                              setFocusRunning(false);
                              setFocusDockOpen(false);
                            }}
                            className="button-motion grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/5 text-white/75"
                            aria-label="End focus timer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="focus-compact"
                        className="flex w-16 items-center justify-center px-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <span className="font-mono text-xs font-bold tabular-nums text-white [writing-mode:vertical-rl]">
                          {focusLabel}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}

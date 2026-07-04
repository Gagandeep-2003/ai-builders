"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Command,
  Droplets,
  MousePointer2,
  Palette,
  Pause,
  Play,
  Search,
  Sparkles,
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

const SEARCH_ALIASES: Record<string, string[]> = {
  assignment: ["homework", "task", "challenge"],
  assignments: ["homework", "tasks", "challenges"],
  deck: ["resource", "presentation", "slides", "canva"],
  lesson: ["session", "curriculum", "module"],
  lessons: ["sessions", "curriculum", "modules"],
  meeting: ["class", "meet", "schedule"],
  score: ["progress", "completed", "submitted"],
  submission: ["homework", "submitted", "evidence"],
  teacher: ["class", "mentor", "schedule"],
  video: ["resource", "session", "canva"],
};

function expandSearchTerms(query: string) {
  const terms = normalize(query).split(" ").filter(Boolean);
  return Array.from(new Set(terms.flatMap((term) => [term, ...(SEARCH_ALIASES[term] ?? [])])));
}

function scoreItem(item: StudentSearchItem, query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return 0;

  const terms = expandSearchTerms(query);
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

function playBubblePop(context: AudioContext | null) {
  if (!context) return;
  void context.resume().catch(() => undefined);
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const startFrequency = 400 + Math.random() * 400;
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(startFrequency, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(startFrequency * 1.5, context.currentTime + 0.1);
  gain.gain.setValueAtTime(0, context.currentTime);
  gain.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.1);
}

function playValveThunk(context: AudioContext | null) {
  if (!context) return;
  void context.resume().catch(() => undefined);
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(100, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(20, context.currentTime + 0.15);
  gain.gain.setValueAtTime(0.5, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.15);
}

function playLiquidAlarm(context: AudioContext | null) {
  if (!context) return;
  void context.resume().catch(() => undefined);
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(800, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(400, context.currentTime + 0.2);
  gain.gain.setValueAtTime(0.3, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.4);
}

function LiquidPressureTimer({
  getAudioContext,
  onStart,
}: {
  getAudioContext: () => AudioContext | null;
  onStart: (minutes: number) => void;
}) {
  const fillIntervalRef = useRef<number | null>(null);
  const bubbleIntervalRef = useRef<number | null>(null);
  const minutesRef = useRef(0);
  const [holding, setHolding] = useState(false);
  const [minutes, setMinutes] = useState(0);

  const stopIntervals = useCallback(() => {
    if (fillIntervalRef.current) window.clearInterval(fillIntervalRef.current);
    if (bubbleIntervalRef.current) window.clearInterval(bubbleIntervalRef.current);
    fillIntervalRef.current = null;
    bubbleIntervalRef.current = null;
  }, []);

  useEffect(() => stopIntervals, [stopIntervals]);

  function startFilling(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    stopIntervals();
    minutesRef.current = 0;
    setMinutes(0);
    setHolding(true);
    navigator.vibrate?.([20, 20, 20]);
    bubbleIntervalRef.current = window.setInterval(() => {
      if (Math.random() > 0.3) playBubblePop(getAudioContext());
    }, 50);
    fillIntervalRef.current = window.setInterval(() => {
      minutesRef.current = Math.min(60, minutesRef.current + 0.5);
      setMinutes(minutesRef.current);
      if (minutesRef.current % 1 === 0) navigator.vibrate?.(10);
      if (minutesRef.current >= 60) stopIntervals();
    }, 30);
  }

  function stopFilling(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!holding) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setHolding(false);
    stopIntervals();
    playValveThunk(getAudioContext());
    navigator.vibrate?.(50);
    const selectedMinutes = Math.floor(minutesRef.current);
    if (selectedMinutes > 0) onStart(selectedMinutes);
  }

  const fluidPercentage = Math.min(100, (minutes / 60) * 100);
  const shownMinutes = Math.floor(minutes);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-[#050914] p-6 text-white shadow-[0_28px_100px_rgba(0,102,255,0.18)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#111a30_0%,transparent_52%),linear-gradient(0deg,rgba(0,240,255,0.04),transparent)]" />
      <div className="relative">
        <div className="mb-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">Liquid pressure timer</p>
          <h3 className="mt-2 font-heading text-2xl font-bold">Hold to fill. Release to focus.</h3>
          <p className="mt-2 text-sm text-slate-400">The longer you hold the valve, the longer your focus session.</p>
        </div>
        <div className="flex min-h-[400px] items-end justify-center gap-8 sm:gap-12">
          <div className="relative h-[360px] w-[108px] overflow-hidden rounded-[54px_54px_18px_18px] border-2 border-white/20 bg-white/5 shadow-[inset_0_0_30px_rgba(0,0,0,0.8),inset_0_0_10px_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm">
            <div className="pointer-events-none absolute inset-y-[5%] left-[10%] z-20 w-[30%] rounded-2xl bg-gradient-to-r from-white/10 to-transparent" />
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between py-9">
              {Array.from({ length: 6 }).map((_, index) => (
                <span key={index} className="ml-2.5 h-0.5 w-4 bg-white/30" />
              ))}
            </div>
            <div
              className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-[#00f0ff] to-[#0066ff] shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-[height] duration-100"
              style={{ height: `${fluidPercentage}%` }}
            >
              <svg
                className={`absolute -top-4 left-0 h-5 w-[200%] fill-[#00f0ff] ${
                  holding ? "animate-[liquid-boil_0.5s_linear_infinite]" : "animate-[liquid-slosh_3s_linear_infinite]"
                }`}
                viewBox="0 0 800 50"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M0,25 C100,50 150,0 200,25 C250,50 300,0 400,25 C500,50 550,0 600,25 C650,50 700,0 800,25 L800,50 L0,50 Z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-5 pb-5">
            <div>
              <p className={`font-mono text-sm uppercase tracking-[0.16em] ${holding ? "text-cyan-300" : "text-slate-400"}`}>
                {holding ? "Pressurizing..." : "System idle"}
              </p>
              <p className="mt-1 w-40 font-mono text-5xl font-bold tabular-nums text-white [text-shadow:0_0_20px_rgba(255,255,255,0.3)]">
                {String(shownMinutes).padStart(2, "0")}:00
              </p>
            </div>
            <motion.button
              type="button"
              onPointerDown={startFilling}
              onPointerUp={stopFilling}
              onPointerCancel={stopFilling}
              className={`touch-none rounded-xl border-2 px-5 py-5 font-mono text-sm font-bold uppercase tracking-[0.15em] transition ${
                holding
                  ? "translate-y-1 border-cyan-300 bg-gradient-to-br from-slate-900 to-slate-950 text-cyan-300 shadow-[0_2px_5px_rgba(0,0,0,0.5),inset_0_4px_10px_rgba(0,0,0,0.8),0_0_20px_rgba(0,240,255,0.4)]"
                  : "border-slate-700 bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.1)]"
              }`}
              whileTap={{ y: 4 }}
            >
              Hold to fill
            </motion.button>
          </div>
        </div>
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
  studentId,
  studentName,
}: {
  studentId: string;
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
  const [waterRelease, setWaterRelease] = useState(false);
  const [splashCursorEnabled, setSplashCursorEnabled] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { theme } = useTheme();
  const splashCursorPreferenceKey = `ai-builders-splash-cursor-enabled:${studentId}`;
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
  const isTimerCommand =
    searched &&
    ["timer", "focus", "focus timer", "study timer", "pomodoro", "pressure timer"].some(
      (command) => normalizedSubmittedQuery === command || normalizedSubmittedQuery.includes(command),
    );
  const isCursorCommand =
    searched &&
    ["cursor", "fluid cursor", "splash cursor", "rainbow cursor", "normal cursor"].some(
      (command) => normalizedSubmittedQuery === command || normalizedSubmittedQuery.includes(command),
    );
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
      description: "Search timer, focus, study timer, or pomodoro; then hold the pressure valve to choose a duration.",
    },
    {
      title: "Control the fluid cursor",
      description: "Use the Fluid cursor quick action to switch the rainbow trail on or return to the normal cursor.",
    },
  ];

  useEffect(() => {
    const initialStateTimer = window.setTimeout(() => {
      setSplashCursorEnabled(window.localStorage.getItem(splashCursorPreferenceKey) !== "false");
    }, 0);

    const handleState = (event: Event) => {
      const enabled = (event as CustomEvent<{ enabled: boolean }>).detail?.enabled;
      if (typeof enabled === "boolean") setSplashCursorEnabled(enabled);
    };

    window.addEventListener("portal:splash-cursor-state", handleState);
    return () => {
      window.clearTimeout(initialStateTimer);
      window.removeEventListener("portal:splash-cursor-state", handleState);
    };
  }, [splashCursorPreferenceKey]);

  function toggleSplashCursor() {
    const enabled = !splashCursorEnabled;
    setSplashCursorEnabled(enabled);
    window.localStorage.setItem(splashCursorPreferenceKey, String(enabled));
    window.dispatchEvent(new CustomEvent("portal:set-splash-cursor", { detail: { enabled } }));
  }

  const results = useMemo(() => {
    if (
      !searched ||
      !submittedQuery.trim() ||
      isHelp ||
      isThemeCommand ||
      isTimerCommand ||
      isCursorCommand
    ) return [];
    return items
      .map((item) => ({ item, score: scoreItem(item, submittedQuery) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ item }) => item);
  }, [isCursorCommand, isHelp, isThemeCommand, isTimerCommand, items, searched, submittedQuery]);

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

    const handleQuickChat = () => {
      ensureAudioContext();
      setOpen(true);
      void loadSearchItems();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("portal:open-quick-chat", handleQuickChat);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("portal:open-quick-chat", handleQuickChat);
    };
  }, [ensureAudioContext, loadSearchItems]);

  useEffect(() => {
    if (!open) return;
    speakGreeting();
    const timer = window.setTimeout(() => inputRef.current?.focus(), 160);
    return () => window.clearTimeout(timer);
  }, [open, speakGreeting]);

  useEffect(() => {
    if (!searched || (results.length === 0 && !isHelp && !isThemeCommand && !isTimerCommand && !isCursorCommand)) return;
    const count = isHelp ? helpItems.length : isThemeCommand || isTimerCommand || isCursorCommand ? 1 : Math.min(results.length, 4);
    Array.from({ length: count }).forEach((_, index) => {
      window.setTimeout(() => playResultTone(audioContextRef.current, index), index * 95);
    });
  }, [helpItems.length, isCursorCommand, isHelp, isThemeCommand, isTimerCommand, results.length, searched]);

  useEffect(() => {
    if (!focusRunning) return;
    const timer = window.setInterval(() => {
      setFocusSeconds((seconds) => {
        if (seconds <= 1) {
          setFocusRunning(false);
          setWaterRelease(true);
          playLiquidAlarm(audioContextRef.current);
          window.setTimeout(() => playLiquidAlarm(audioContextRef.current), 200);
          window.setTimeout(() => playLiquidAlarm(audioContextRef.current), 400);
          window.setTimeout(() => setWaterRelease(false), 2200);
          navigator.vibrate?.([100, 100, 100, 100, 100]);
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
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSplashCursor}
                  data-cursor-tour="fluid-toggle"
                  className="button-motion inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-bg-elevated px-3 text-xs font-semibold text-text-secondary hover:border-accent/40 hover:text-accent"
                  aria-label={`${splashCursorEnabled ? "Disable" : "Enable"} fluid cursor`}
                  aria-pressed={splashCursorEnabled}
                >
                  <MousePointer2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Fluid cursor</span>
                  <span className={splashCursorEnabled ? "text-accent" : "text-text-muted"}>
                    {splashCursorEnabled ? "On" : "Off"}
                  </span>
                </button>
                <button
                  onClick={close}
                  className="button-motion grid h-10 w-10 place-items-center rounded-xl border border-border bg-bg-elevated text-text-secondary"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
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
                        className="group overflow-hidden rounded-2xl border border-cyan-300/20 bg-[radial-gradient(circle_at_85%_0%,rgba(0,240,255,0.13),transparent_45%),rgba(255,255,255,0.025)] p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/45"
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="font-heading font-bold text-text-primary">Pressure Timer</span>
                          <Droplets className="h-4 w-4 text-cyan-300" />
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-text-secondary">
                          Hold the valve to fill the vial. Release when your focus duration is ready.
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
                      <button
                        onClick={toggleSplashCursor}
                        className="group rounded-2xl border border-border bg-white/[0.025] p-4 text-left transition hover:-translate-y-0.5 hover:border-accent/35"
                        aria-pressed={splashCursorEnabled}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="font-heading font-bold text-text-primary">Fluid cursor</span>
                          <MousePointer2 className="h-4 w-4 text-accent" />
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-text-secondary">
                          {splashCursorEnabled
                            ? "On · Switch off to use the normal cursor."
                            : "Off · Turn on the rainbow fluid trail."}
                        </span>
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-text-muted">
                        Try
                      </span>
                      {["continue homework", "my next class", "module 2 resources", "submitted work", "timer"].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => runQuery(suggestion)}
                          className="rounded-full border border-border bg-bg-elevated/70 px-3 py-1.5 text-xs text-text-secondary transition hover:border-accent/35 hover:text-accent"
                        >
                          {suggestion}
                        </button>
                      ))}
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
                ) : timerSetupOpen || isTimerCommand ? (
                  <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                  >
                    <LiquidPressureTimer getAudioContext={ensureAudioContext} onStart={startFocusTimer} />
                  </motion.div>
                ) : isCursorCommand ? (
                  <motion.div
                    className="overflow-hidden rounded-3xl border border-accent/25 bg-bg-base/80 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
                    initial={{ opacity: 0, y: 18, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  >
                    <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(168,85,247,0.16),transparent_34%),radial-gradient(circle_at_86%_34%,rgba(6,182,212,0.13),transparent_32%)]" />
                      <div className="relative flex items-start gap-4">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
                          <MousePointer2 className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                            Cursor effect
                          </p>
                          <h3 className="mt-2 font-heading text-2xl font-bold">
                            Fluid cursor is {splashCursorEnabled ? "on" : "off"}
                          </h3>
                          <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
                            The rainbow fluid trail appears over student pages, excluding the sidebar and AI Builders League.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={toggleSplashCursor}
                        className="button-motion relative min-h-12 w-full rounded-xl border border-accent/30 bg-accent px-5 font-heading font-bold text-bg-base sm:w-auto sm:min-w-48"
                      >
                        {splashCursorEnabled ? "Use normal cursor" : "Enable fluid cursor"}
                      </button>
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
            drag
            dragConstraints={{ top: -220, right: 24, bottom: 220, left: -280 }}
            dragElastic={0.06}
            dragMomentum={false}
            className="fixed bottom-5 right-5 z-[65] w-[min(19rem,calc(100vw-2rem))] touch-none sm:bottom-7 sm:right-7"
            initial={{ y: 28, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div className="relative cursor-grab overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#07101f]/95 p-3.5 text-white shadow-[0_18px_60px_rgba(0,0,0,0.34),0_0_36px_rgba(0,240,255,0.12)] backdrop-blur-xl active:cursor-grabbing">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(0,240,255,0.14),transparent_40%)]" />
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-10 shrink-0 overflow-hidden rounded-[20px_20px_7px_7px] border border-white/25 bg-white/5 shadow-[inset_0_0_14px_rgba(0,0,0,0.75)]">
                  <div className="pointer-events-none absolute inset-y-[8%] left-[12%] z-20 w-[28%] rounded-full bg-gradient-to-r from-white/12 to-transparent" />
                  <div
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-[#00f0ff] to-[#0066ff] shadow-[0_0_14px_rgba(0,240,255,0.55)] transition-[height] duration-500"
                    style={{ height: `${Math.max(3, (focusSeconds / focusTotalSeconds) * 100)}%` }}
                  >
                    <svg
                      className="absolute -top-1.5 left-0 h-2 w-[200%] animate-[liquid-slosh_3s_linear_infinite] fill-[#00f0ff]"
                      viewBox="0 0 800 50"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path d="M0,25 C100,50 150,0 200,25 C250,50 300,0 400,25 C500,50 550,0 600,25 C650,50 700,0 800,25 L800,50 L0,50 Z" />
                    </svg>
                  </div>
                </div>

                <div className="relative min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.18em] text-cyan-300">
                        Liquid focus
                      </p>
                      <p className="mt-1 font-heading text-xs font-bold text-slate-300">
                        {focusRunning ? "Depleting" : "Pressure paused"}
                      </p>
                    </div>
                    <p className="font-mono text-2xl font-bold tabular-nums">{focusLabel}</p>
                  </div>
                </div>

                <div className="relative flex shrink-0 flex-col gap-1.5">
                  <button
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => setFocusRunning((running) => !running)}
                    className="button-motion grid h-8 w-8 place-items-center rounded-full bg-cyan-300 text-slate-950"
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
                    className="button-motion grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/55"
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

      <AnimatePresence>
        {waterRelease ? (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[90] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-x-0 bottom-0 h-[125%] bg-gradient-to-b from-[#00f0ff]/90 via-[#008cff]/95 to-[#0038a8]"
              initial={{ y: "105%" }}
              animate={{ y: ["105%", "8%", "18%", "-115%"] }}
              transition={{ duration: 2.1, times: [0, 0.38, 0.58, 1], ease: "easeInOut" }}
            >
              <svg
                className="absolute -top-16 left-0 h-20 w-[200%] animate-[liquid-boil_0.5s_linear_infinite] fill-[#00f0ff]"
                viewBox="0 0 800 50"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M0,25 C100,50 150,0 200,25 C250,50 300,0 400,25 C500,50 550,0 600,25 C650,50 700,0 800,25 L800,50 L0,50 Z" />
              </svg>
            </motion.div>
            <motion.div
              className="absolute inset-0 grid place-items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1, 1, 1.05] }}
              transition={{ duration: 1.8, times: [0, 0.28, 0.68, 1] }}
            >
              <div className="rounded-2xl border border-white/30 bg-[#050914]/75 px-7 py-5 text-center text-white shadow-[0_0_70px_rgba(0,240,255,0.45)] backdrop-blur-xl">
                <Droplets className="mx-auto h-7 w-7 text-cyan-200" />
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-cyan-200">Pressure released</p>
                <p className="mt-1 font-heading text-xl font-bold">Focus session complete</p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

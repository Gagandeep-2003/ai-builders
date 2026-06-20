"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Clipboard,
  Command,
  Lightbulb,
  Palette,
  Pause,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  TimerReset,
  WandSparkles,
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

function commandParts(value: string) {
  const match = value.trim().match(/^\/([a-z-]+)\s*(.*)$/i);
  return { command: match?.[1]?.toLowerCase() ?? "", input: match?.[2]?.trim() ?? "" };
}

function buildLocalUtility(command: string, input: string) {
  if (command === "prompt") {
    return {
      title: "Prompt upgrade",
      eyebrow: "Prompt Studio",
      text: `Act as an expert learning coach.\n\nContext: I am working on ${input || "[YOUR TOPIC]"}.\n\nTask: Help me produce a clear, accurate, practical result.\n\nRequirements:\n- Ask up to 3 useful questions if context is missing.\n- Explain the reasoning in beginner-friendly steps.\n- Include one example.\n- Finish with a short quality checklist.\n\nOutput format: Use concise headings, bullets, and a final action step.`,
    };
  }
  if (command === "plan") {
    return {
      title: "Learning sprint",
      eyebrow: "Plan Builder",
      text: `Goal: ${input || "[YOUR GOAL]"}\n\n1. Define the finished result in one sentence.\n2. Gather the minimum tools or information needed.\n3. Build the smallest useful first version.\n4. Test it with one realistic example.\n5. Record what worked and what needs improvement.\n6. Refine once, then save evidence of the result.\n\nSuccess check: Can you explain what you made, demonstrate it, and name one next improvement?`,
    };
  }
  if (command === "quiz") {
    const topic = input || "[YOUR TOPIC]";
    return {
      title: "Active-recall quiz",
      eyebrow: "Quiz Builder",
      text: `Topic: ${topic}\n\n1. Explain ${topic} in one sentence without notes.\n2. What problem does ${topic} solve?\n3. Name three important ideas connected to ${topic}.\n4. Give one real-world example and explain why it fits.\n5. What is one common mistake or limitation?\n\nSelf-check: Review your session resource, correct weak answers, then answer question 1 again more clearly.`,
    };
  }
  if (command === "reflect") {
    return {
      title: "Reflection canvas",
      eyebrow: "Learning Journal",
      text: `Topic or task: ${input || "[YOUR WORK]"}\n\n- What did I create or understand?\n- Which step was most difficult?\n- What evidence shows that the result works?\n- What changed after I refined it?\n- What would I do differently next time?\n- What is my next smallest action?`,
    };
  }
  return null;
}

function createAudioContext() {
  if (typeof window === "undefined") return;
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return;

  return new AudioContextCtor();
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
  const [copied, setCopied] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [focusRunning, setFocusRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { theme } = useTheme();
  const firstName = studentName.split(" ")[0] || "Builder";
  const normalizedSubmittedQuery = normalize(submittedQuery);
  const submittedCommand = commandParts(submittedQuery);
  const isHelp = searched && ["/help", "help", "?"].includes(normalizedSubmittedQuery);
  const isThemeCommand =
    searched &&
    (normalizedSubmittedQuery === "toggle theme" ||
      normalizedSubmittedQuery === "theme" ||
      normalizedSubmittedQuery.includes("dark mode") ||
      normalizedSubmittedQuery.includes("light mode") ||
      (normalizedSubmittedQuery.includes("toggle") && normalizedSubmittedQuery.includes("theme")));
  const isFocusCommand = searched && submittedCommand.command === "focus";
  const utilityResult = searched
    ? buildLocalUtility(submittedCommand.command, submittedCommand.input)
    : null;
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
      title: "Build better work",
      description: "Try: /prompt, /plan, /quiz, or /reflect followed by your topic.",
    },
    {
      title: "Start a focus sprint",
      description: "Try: /focus 25 to launch a distraction-free 25-minute timer.",
    },
  ];

  const results = useMemo(() => {
    if (
      !searched ||
      !submittedQuery.trim() ||
      isHelp ||
      isThemeCommand ||
      isFocusCommand ||
      utilityResult
    ) return [];
    return items
      .map((item) => ({ item, score: scoreItem(item, submittedQuery) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ item }) => item);
  }, [isFocusCommand, isHelp, isThemeCommand, items, searched, submittedQuery, utilityResult]);

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
    const nextCommand = commandParts(nextQuery);
    if (nextCommand.command === "focus") {
      const requestedMinutes = Number.parseInt(nextCommand.input, 10);
      const minutes = Number.isFinite(requestedMinutes)
        ? Math.min(90, Math.max(1, requestedMinutes))
        : 25;
      setFocusSeconds(minutes * 60);
      setFocusRunning(true);
    }
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
    setCopied(false);
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const nextQuery = query.trim();
    if (!nextQuery) return;
    runQuery(nextQuery);
  }

  async function copyUtilityText(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  const focusMinutes = Math.floor(focusSeconds / 60);
  const focusRemainder = focusSeconds % 60;

  return (
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
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {[
                        "/help",
                        "/focus 25",
                        "/prompt explain neural networks",
                        "/quiz prompt engineering",
                        "next class",
                        "module 1 homework",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => runQuery(suggestion)}
                          className="rounded-xl border border-border bg-white/[0.025] px-4 py-3 text-left text-sm text-text-secondary transition hover:border-accent/35 hover:text-text-primary"
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
                ) : isFocusCommand ? (
                  <motion.div
                    className="overflow-hidden rounded-3xl border border-cyan-300/25 bg-bg-base/82 p-6 shadow-[0_24px_100px_rgba(6,182,212,0.12)]"
                    initial={{ opacity: 0, y: 18, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
                        <TimerReset className="h-6 w-6" />
                      </span>
                      <p className="mt-5 font-mono text-xs uppercase tracking-[0.2em] text-cyan-200">
                        Focus chamber
                      </p>
                      <p className="mt-3 font-mono text-6xl font-bold tabular-nums text-text-primary sm:text-7xl">
                        {String(focusMinutes).padStart(2, "0")}:{String(focusRemainder).padStart(2, "0")}
                      </p>
                      <p className="mt-3 max-w-lg text-sm text-text-secondary">
                        Work on one task only. When the timer ends, record one sentence about what moved forward.
                      </p>
                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => setFocusRunning((running) => !running)}
                          className="button-motion inline-flex items-center gap-2 rounded-xl bg-cyan-200 px-5 py-3 font-bold text-slate-950"
                        >
                          {focusRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          {focusRunning ? "Pause" : "Resume"}
                        </button>
                        <button
                          onClick={() => {
                            setFocusSeconds(25 * 60);
                            setFocusRunning(false);
                          }}
                          className="button-motion grid h-12 w-12 place-items-center rounded-xl border border-border bg-bg-elevated text-text-secondary"
                          aria-label="Reset focus timer"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : utilityResult ? (
                  <motion.div
                    className="overflow-hidden rounded-3xl border border-violet-300/25 bg-bg-base/82 shadow-[0_24px_100px_rgba(124,58,237,0.14)]"
                    initial={{ opacity: 0, y: 18, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                  >
                    <div className="flex items-start justify-between gap-4 border-b border-border/70 p-5">
                      <div className="flex gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-violet-300/25 bg-violet-300/10 text-violet-200">
                          {submittedCommand.command === "prompt"
                            ? <WandSparkles className="h-5 w-5" />
                            : <Lightbulb className="h-5 w-5" />}
                        </span>
                        <div>
                          <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-violet-200">
                            {utilityResult.eyebrow}
                          </p>
                          <h3 className="mt-1 font-heading text-xl font-bold">{utilityResult.title}</h3>
                        </div>
                      </div>
                      <button
                        onClick={() => void copyUtilityText(utilityResult.text)}
                        className="button-motion inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-bg-elevated px-3 text-xs text-text-secondary"
                      >
                        {copied ? <Check className="h-4 w-4 text-accent" /> : <Clipboard className="h-4 w-4" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <pre className="scrollbar-soft max-h-96 overflow-auto whitespace-pre-wrap p-5 font-sans text-sm leading-7 text-text-secondary">
                      {utilityResult.text}
                    </pre>
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
  );
}

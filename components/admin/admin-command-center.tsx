"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  ClipboardCheck,
  Command,
  KeyRound,
  Search,
  Sparkles,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminCommandAction = {
  title: string;
  description: string;
  href: string;
  tone: "accent" | "info" | "warm" | "danger";
  count?: number;
  keywords: string[];
};

export type AdminCommandCenterData = {
  todayClasses: number;
  pendingHomework: number;
  pendingReschedules: number;
  pendingPasswords: number;
  onlineStudents: number;
  actions: AdminCommandAction[];
};

const toneStyles = {
  accent: "border-accent/30 bg-accent/10 text-accent",
  info: "border-info/30 bg-info/10 text-blue-200",
  warm: "border-accent-warm/30 bg-accent-warm/10 text-amber-100",
  danger: "border-danger/30 bg-danger/10 text-rose-100",
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function scoreAction(action: AdminCommandAction, query: string) {
  const q = normalize(query);
  if (!q) return action.count ? action.count + 2 : 1;
  const terms = q.split(" ").filter(Boolean);
  const haystack = normalize([action.title, action.description, action.href, action.keywords.join(" ")].join(" "));
  let score = action.count ?? 0;
  for (const term of terms) {
    if (normalize(action.title).includes(term)) score += 12;
    if (action.keywords.some((keyword) => normalize(keyword).includes(term))) score += 8;
    if (haystack.includes(term)) score += 3;
  }
  if (haystack.includes(q)) score += 15;
  return score;
}

export function AdminCommandCenter({ data }: { data: AdminCommandCenterData }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredActions = useMemo(
    () =>
      data.actions
        .map((action) => ({ action, score: scoreAction(action, query) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ action }) => action),
    [data.actions, query],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || !event.altKey) return;
      event.preventDefault();
      setOpen((value) => !value);
    };

    const handleQuickChat = () => setOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("portal:open-quick-chat", handleQuickChat);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("portal:open-quick-chat", handleQuickChat);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 100);
    return () => window.clearTimeout(timer);
  }, [open]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[75] bg-bg-base/82 p-4 backdrop-blur-2xl sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button className="absolute inset-0 cursor-default" onClick={close} aria-label="Close command center" />
          <motion.section
            className="premium-card no-border-glow relative mx-auto flex max-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl p-0 shadow-[0_34px_120px_rgba(0,0,0,0.55)]"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_50%_0%,rgba(110,231,183,0.18),transparent_60%)]" />
            <div className="relative z-10 flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-heading text-lg font-bold">Admin Command Center</p>
                  <p className="text-xs text-text-muted">Option/Alt + Space opens this anywhere in admin.</p>
                </div>
              </div>
              <button
                onClick={close}
                className="button-motion grid h-10 w-10 place-items-center rounded-xl border border-border bg-bg-elevated text-text-secondary"
                aria-label="Close command center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative z-10 overflow-y-auto px-5 py-5">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-accent" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search students, classes, requests, homework, resources..."
                  className="w-full rounded-2xl border border-accent/25 bg-bg-base/78 py-4 pl-12 pr-4 font-heading text-lg font-bold outline-none transition focus:border-accent/70"
                />
              </label>

              <div className="mt-5 grid gap-3 sm:grid-cols-5">
                {([
                  ["Classes today", data.todayClasses, CalendarClock, "info"],
                  ["Homework review", data.pendingHomework, ClipboardCheck, "warm"],
                  ["Make-up requests", data.pendingReschedules, Command, "accent"],
                  ["Password requests", data.pendingPasswords, KeyRound, "danger"],
                  ["Online students", data.onlineStudents, UserRound, "accent"],
                ] satisfies Array<[string, number, LucideIcon, keyof typeof toneStyles]>).map(([label, value, Icon, tone]) => (
                  <div key={String(label)} className={cn("rounded-2xl border p-4", toneStyles[tone as keyof typeof toneStyles])}>
                    <Icon className="h-4 w-4" />
                    <p className="mt-3 font-mono text-[0.64rem] uppercase tracking-[0.14em] opacity-80">{String(label)}</p>
                    <p className="mt-1 font-heading text-2xl font-black">{String(value)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {filteredActions.map((action, index) => (
                  <motion.div
                    key={action.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.035 }}
                  >
                    <Link
                      href={action.href}
                      onClick={close}
                      className="group flex min-h-28 items-start justify-between gap-4 rounded-2xl border border-border bg-white/[0.025] p-4 transition hover:border-accent/35 hover:bg-accent/5"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn("rounded-full border px-2.5 py-1 font-mono text-[0.64rem] uppercase", toneStyles[action.tone])}>
                            {action.count ? `${action.count} open` : "Open"}
                          </span>
                        </div>
                        <h3 className="mt-3 font-heading text-lg font-bold">{action.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-text-secondary">{action.description}</p>
                      </div>
                      <ArrowRight className="mt-2 h-5 w-5 shrink-0 text-text-muted transition group-hover:translate-x-1 group-hover:text-accent" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

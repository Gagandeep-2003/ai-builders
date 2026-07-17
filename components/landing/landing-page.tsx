"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  Code2,
  Layers3,
  Mail,
  Menu,
  MonitorPlay,
  PencilRuler,
  Presentation,
  ShieldCheck,
  Upload,
  Workflow,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { AnimatePresence, motion } from "framer-motion";
import { modules, sessions } from "@/lib/course-data";
import { cn } from "@/lib/utils";

const APPLY_MAILTO =
  "mailto:hello@aibuilders.example?subject=AI%20Builders%20Academy%20Application";

const taglines = ["Code smarter.", "Research better.", "Create faster."];

const moduleIcons = [BrainCircuit, Code2, Workflow];

const navLinks = [
  { href: "#curriculum", label: "Curriculum" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#parents", label: "For Parents" },
  { href: "#faq", label: "FAQ" },
];

const howItWorks = [
  {
    icon: MonitorPlay,
    title: "Learn live",
    text: "Students join scheduled live classes from the portal, in their own timezone, with one click.",
  },
  {
    icon: PencilRuler,
    title: "Build in session",
    text: "Every session is hands-on: real AI tools, real prompts, and a concrete artifact by the end.",
  },
  {
    icon: Upload,
    title: "Submit evidence",
    text: "Class challenges and home tasks are tracked in the portal — started, submitted, and mentor-reviewed.",
  },
  {
    icon: Presentation,
    title: "Showcase",
    text: "Each module ends with a showcase session where students present what they built and explain how.",
  },
];

const faqs = [
  {
    question: "Who is this program for?",
    answer:
      "Students who want practical AI literacy — from prompting fundamentals through building real apps to designing automation workflows. No prior coding experience is needed; the course starts from the foundations and builds up.",
  },
  {
    question: "What does a student actually build?",
    answer:
      "Every session produces an artifact: AI study systems, creative media boards, no-code app prototypes, GPT wrappers, automation workflows with n8n and Zapier, and a showcase presentation at the end of each module.",
  },
  {
    question: "How do classes work across timezones?",
    answer:
      "The portal is timezone-aware. Class times, schedules, and reminders are always shown in the student's own local timezone — daylight saving included — so international students never have to convert times themselves.",
  },
  {
    question: "How do parents follow progress?",
    answer:
      "Parents can see concrete evidence inside the portal: unlocked sessions, submitted homework with mentor feedback, class attendance, badges, and what comes next — not vague reports.",
  },
  {
    question: "How is homework handled?",
    answer:
      "Each session normally has a Class Challenge and a Home Task. Students press Start Task, work in an embedded document, and Mark Complete when done. Mentors review submissions and can approve or request changes.",
  },
  {
    question: "How do we apply?",
    answer:
      "Email us using the Apply button and we'll get back to you with details about the next batch, schedule options for your timezone, and how enrolment works.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [openItem, setOpenItem] = useState(false);
  return (
    <div className="premium-card no-border-glow rounded-xl">
      <button
        onClick={() => setOpenItem((value) => !value)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
        aria-expanded={openItem}
      >
        <span className="font-heading font-bold">{question}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-accent transition-transform duration-200",
            openItem && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {openItem ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 leading-7 text-text-secondary">{answer}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function LandingPage() {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState(modules[0].id);

  useEffect(() => {
    const timer = window.setInterval(
      () => setTaglineIndex((index) => (index + 1) % taglines.length),
      1900,
    );

    return () => window.clearInterval(timer);
  }, []);

  const toolCount = useMemo(
    () => new Set(sessions.flatMap((session) => session.toolsCovered)).size,
    [],
  );
  const activeModule = modules.find((module) => module.id === activeModuleId) ?? modules[0];
  const activeSessions = sessions.filter((session) => session.moduleId === activeModule.id);

  return (
    <main className="min-h-screen">
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-bg-base/78 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <BrandMark className="h-10 w-10" />
            <span>
              <span className="block font-heading text-sm font-bold">AI Builders</span>
              <span className="block font-mono text-[10px] uppercase text-text-muted">
                AI Builders Academy
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-3 py-2 text-sm text-text-secondary transition hover:text-text-primary"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <Link
              href="/login"
              className="button-motion rounded-xl border border-border bg-bg-card px-4 py-2 text-sm font-bold text-text-primary"
            >
              Student Login
            </Link>
            <button
              onClick={() => setMobileNavOpen((value) => !value)}
              className="button-motion rounded-xl border border-border bg-bg-card p-2.5 text-text-primary md:hidden"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileNavOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden border-t border-border/60 md:hidden"
            >
              <div className="space-y-1 px-4 py-3">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileNavOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm text-text-secondary transition hover:bg-white/[0.04] hover:text-text-primary"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href={APPLY_MAILTO}
                  onClick={() => setMobileNavOpen(false)}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm font-bold text-bg-base"
                >
                  Apply for the Next Batch
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="absolute left-1/2 top-16 h-[520px] w-[980px] -translate-x-1/2 rounded-full border border-accent/10 bg-accent/[0.025] blur-3xl" />
        </div>
        <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_0.78fr] lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 font-mono text-xs uppercase text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_16px_rgba(110,231,183,0.85)]" />
              Private AI tutoring portal
            </div>
            <h1 className="mt-8 max-w-4xl font-heading text-5xl font-extrabold leading-[1.03] text-text-primary sm:text-6xl lg:text-7xl">
              Build with AI. Think with AI. Create with AI.
            </h1>
            <div className="mt-6 h-11 overflow-hidden font-heading text-3xl font-bold text-accent sm:text-4xl">
              <AnimatePresence mode="wait">
                <motion.span
                  key={taglines[taglineIndex]}
                  className="block"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.26 }}
                >
                  {taglines[taglineIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
              A premium AI learning program for students who want practical AI literacy,
              app-building confidence, and automation thinking in one focused learning path.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href={APPLY_MAILTO}
                className="button-motion inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-bg-base shadow-[0_18px_44px_rgba(110,231,183,0.18)]"
              >
                Apply for the Next Batch
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/login"
                className="button-motion inline-flex items-center justify-center rounded-xl border border-border bg-bg-card px-5 py-3 font-bold text-text-primary"
              >
                Enter Portal
              </Link>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-3">
              {[
                [String(modules.length), "AI modules"],
                [String(sessions.length), "live sessions"],
                [`${toolCount}+`, "AI tools covered"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-xl border border-border/70 bg-white/[0.025] px-4 py-3"
                >
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span className="block font-heading text-2xl font-extrabold text-text-primary">
                      {value}
                    </span>
                    <span className="mt-0.5 block text-xs uppercase tracking-wide text-text-muted">
                      {label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            className="relative hidden min-h-[540px] lg:block"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            <div className="absolute left-4 top-4 w-[82%] rounded-xl border border-border bg-bg-card/92 p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border/70 pb-4">
                <div>
                  <p className="font-mono text-xs text-accent">CURRENT MODULE</p>
                  <p className="mt-1 font-heading text-lg font-bold">AI Literacy</p>
                </div>
                <Bot className="h-5 w-5 text-accent" />
              </div>
              <div className="mt-5 space-y-3">
                {["Prompting loop", "Source checking", "Portfolio artifact"].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-white/[0.025] px-4 py-3"
                  >
                    <span className="text-sm text-text-secondary">{item}</span>
                    <span className="font-mono text-xs text-accent">0{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-14 right-0 w-[76%] rounded-xl border border-accent/25 bg-bg-elevated/95 p-5 shadow-[0_30px_80px_rgba(110,231,183,0.09)]">
              <p className="font-mono text-xs uppercase text-text-muted">Student output</p>
              <div className="mt-4 space-y-2 font-mono text-sm">
                <p>
                  <span className="text-accent">const</span>{" "}
                  <span className="text-text-primary">idea</span>{" "}
                  <span className="text-text-muted">=</span>{" "}
                  <span className="text-accent-warm">&quot;study hub&quot;</span>
                </p>
                <p className="text-text-secondary">research.checkSources()</p>
                <p className="text-text-secondary">deploy.showcase()</p>
              </div>
            </div>
            <div className="absolute bottom-4 left-10 flex w-52 items-center gap-3 rounded-xl border border-border bg-bg-card p-4">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <div>
                <p className="font-heading text-sm font-bold">6 sessions done</p>
                <p className="text-xs text-text-muted">next: media generation</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="curriculum" className="section-divider scroll-mt-20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase text-accent">Course structure</p>
              <h2 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
                Three modules. Twenty-four focused sessions.
              </h2>
            </div>
            <p className="max-w-xl text-text-secondary">
              Each module produces artifacts students can show: research briefs, app prototypes,
              workflows, and a final capstone.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {modules.map((module, index) => {
              const Icon = moduleIcons[index];
              const active = module.id === activeModuleId;
              return (
                <motion.article
                  key={module.id}
                  className={cn(
                    "premium-card premium-card-hover cursor-pointer rounded-xl p-6",
                    active && "border-accent/40",
                  )}
                  onClick={() => setActiveModuleId(module.id)}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                >
                  <div className="flex items-start justify-between">
                    <Icon className="h-7 w-7 text-accent" />
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase transition",
                        active
                          ? "border-accent/40 bg-accent/10 text-accent"
                          : "border-border text-text-muted",
                      )}
                    >
                      {active ? "Viewing sessions" : "View sessions"}
                    </span>
                  </div>
                  <p className="mt-6 font-mono text-xs uppercase text-text-muted">
                    Module {module.orderIndex} / {module.sessionCount} sessions
                  </p>
                  <h3 className="mt-3 font-heading text-xl font-bold">{module.title}</h3>
                  <p className="mt-4 leading-7 text-text-secondary">{module.description}</p>
                </motion.article>
              );
            })}
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-border/70 bg-bg-card/60">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
              <p className="font-heading font-bold">
                Module {activeModule.orderIndex} · {activeModule.title}
              </p>
              <p className="font-mono text-xs uppercase text-text-muted">
                {activeSessions.length} sessions
              </p>
            </div>
            <AnimatePresence mode="wait">
              <motion.ol
                key={activeModule.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="grid gap-px bg-border/40 sm:grid-cols-2"
              >
                {activeSessions.map((session) => (
                  <li key={session.id} className="bg-bg-card/90 p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-mono text-xs text-accent">
                        {String(session.sessionNumber).padStart(2, "0")}
                      </p>
                      <p className="truncate font-mono text-[10px] uppercase text-text-muted">
                        {session.toolsCovered.join(" · ")}
                      </p>
                    </div>
                    <h4 className="mt-2 font-heading font-bold">{session.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      Output: {session.studentOutput}
                    </p>
                  </li>
                ))}
              </motion.ol>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section-divider scroll-mt-20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="font-mono text-xs uppercase text-accent">How it works</p>
            <h2 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
              A rhythm students can rely on.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.article
                  key={step.title}
                  className="premium-card rounded-xl p-6"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-6 w-6 text-accent" />
                    <span className="font-mono text-xs text-text-muted">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 font-heading text-lg font-bold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-text-secondary">{step.text}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="parents" className="section-divider scroll-mt-20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="font-mono text-xs uppercase text-accent">For parents</p>
            <h2 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
              Built so families always know what&apos;s happening.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["What students build", "Study hubs, AI-assisted websites, chatbot prototypes, and automation systems."],
              ["What parents see", "Clear progress, homework status, attendance, feedback, and class links in one portal."],
              ["What skills they gain", "AI judgment, research discipline, product thinking, coding workflows, and automation design."],
            ].map(([title, text]) => (
              <article key={title} className="premium-card rounded-xl p-6">
                <Layers3 className="h-6 w-6 text-accent" />
                <h3 className="mt-5 font-heading text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-text-secondary">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-divider py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="font-mono text-xs uppercase text-accent">Visible learning evidence</p>
            <h2 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
              Progress families can actually verify.
            </h2>
            <p className="mt-4 leading-7 text-text-secondary">
              Instead of anonymous marketing quotes, the program is designed around concrete evidence
              students and parents can inspect inside the portal.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Every session leaves evidence", "Tasks, submitted proof, class attendance, and tutor feedback stay connected to the learning journey."],
              ["Progress is visible, not vague", "Families can see unlocked sessions, completed work, class consistency, and what comes next."],
              ["The finish is a real showcase", "Students conclude each module with a practical artifact, demo, presentation, or automation they can explain."],
            ].map(([title, text]) => (
              <article key={title} className="premium-card rounded-xl p-6">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <h3 className="mt-5 font-heading text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-text-secondary">{text}</p>
                <p className="mt-5 font-mono text-xs uppercase text-text-muted">Portal-backed outcome</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section-divider scroll-mt-20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="font-mono text-xs uppercase text-accent">FAQ</p>
              <h2 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
                Common questions, straight answers.
              </h2>
              <p className="mt-4 leading-7 text-text-secondary">
                Anything else? Email us and we&apos;ll reply with details for the next batch.
              </p>
              <a
                href={APPLY_MAILTO}
                className="button-motion mt-6 inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-bold text-accent"
              >
                <Mail className="h-4 w-4" />
                Ask a question
              </a>
            </div>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-divider py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="premium-card no-border-glow relative overflow-hidden rounded-2xl p-8 text-center sm:p-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(110,231,183,0.13),transparent_52%)]" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-heading text-3xl font-bold sm:text-4xl">
                Ready to see what your student can build with AI?
              </h2>
              <p className="mx-auto mt-4 max-w-xl leading-7 text-text-secondary">
                Seats are limited per batch so every student gets real attention. Apply now and
                we&apos;ll match you to a schedule in your timezone.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <a
                  href={APPLY_MAILTO}
                  className="button-motion inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-bold text-bg-base shadow-[0_18px_44px_rgba(110,231,183,0.18)]"
                >
                  Apply for the Next Batch
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/login"
                  className="button-motion inline-flex items-center justify-center rounded-xl border border-border bg-bg-card px-6 py-3 font-bold text-text-primary"
                >
                  Enter Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="section-divider">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
          <div className="max-w-xs">
            <div className="flex items-center gap-3">
              <BrandMark className="h-9 w-9" />
              <span>
                <span className="block font-heading text-sm font-bold">AI Builders</span>
                <span className="block font-mono text-[10px] uppercase text-text-muted">
                  AI Builders Academy
                </span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-text-secondary">
              Practical AI literacy, app building, and automation thinking for the next generation
              of builders.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="font-mono text-xs uppercase text-text-muted">Program</p>
              <ul className="mt-3 space-y-2 text-sm">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-text-secondary transition hover:text-text-primary">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs uppercase text-text-muted">Portal</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/login" className="inline-flex items-center gap-1 text-text-secondary transition hover:text-text-primary">
                    Student Login
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-xs uppercase text-text-muted">Contact</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a href={APPLY_MAILTO} className="inline-flex items-center gap-1 text-text-secondary transition hover:text-text-primary">
                    Apply by email
                    <Mail className="h-3.5 w-3.5" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-border/60">
          <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-text-muted sm:px-6 lg:px-8">
            © {new Date().getFullYear()} AI Builders Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

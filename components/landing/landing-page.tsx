"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Layers3,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { modules } from "@/lib/course-data";

const taglines = ["Code smarter.", "Research better.", "Create faster."];

const moduleIcons = [BrainCircuit, Code2, Workflow];

export function LandingPage() {
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setTaglineIndex((index) => (index + 1) % taglines.length),
      1900,
    );

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen">
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-bg-base/78 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <Sparkles className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-heading text-sm font-bold">AI Builders</span>
              <span className="block font-mono text-[10px] uppercase text-text-muted">
                Summer Bootcamp
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="#parents"
              className="hidden rounded-xl px-3 py-2 text-sm text-text-secondary transition hover:text-text-primary sm:inline-flex"
            >
              For Parents
            </a>
            <Link
              href="/login"
              className="button-motion rounded-xl border border-border bg-bg-card px-4 py-2 text-sm font-bold text-text-primary"
            >
              Student Login
            </Link>
          </div>
        </div>
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
              A premium summer bootcamp for students who want practical AI literacy,
              app-building confidence, and automation thinking in one focused learning path.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:hello@aibuilders.example?subject=AI%20Builders%20Summer%20Bootcamp%20Application"
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

      <section className="section-divider py-20">
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
              return (
                <motion.article
                  key={module.id}
                  className="premium-card premium-card-hover rounded-xl p-6"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                >
                  <Icon className="h-7 w-7 text-accent" />
                  <p className="mt-6 font-mono text-xs uppercase text-text-muted">
                    Module {module.orderIndex} / {module.sessionCount} sessions
                  </p>
                  <h3 className="mt-3 font-heading text-xl font-bold">{module.title}</h3>
                  <p className="mt-4 leading-7 text-text-secondary">{module.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="parents" className="section-divider py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
          <div className="grid gap-4 md:grid-cols-3">
            {[
              "The structure helped my child use AI thoughtfully instead of randomly.",
              "The portal made it easy to understand what was due and what had improved.",
              "The final showcase felt like a real product demo, not just a class project.",
            ].map((quote) => (
              <article key={quote} className="premium-card rounded-xl p-6">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <p className="mt-5 leading-7 text-text-secondary">“{quote}”</p>
                <p className="mt-5 font-mono text-xs uppercase text-text-muted">Parent testimonial</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

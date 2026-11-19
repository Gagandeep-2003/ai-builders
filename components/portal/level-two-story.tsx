"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  GitBranch,
  MessageCircle,
  Orbit,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import styles from "./level-two-story.module.css";

const chapters = [
  {
    number: "01",
    eyebrow: "LangChain · Build the mind",
    title: "Turn a single prompt into a system that remembers.",
    copy: "Connect models, documents, memory, retrieval and tools—then watch separate AI abilities begin working as one capable assistant.",
    accent: "mint",
    icon: BrainCircuit,
    beats: ["Reliable prompts", "Document intelligence", "RAG + tool calling"],
    outcome: "Build an assistant that can search knowledge and act with context.",
  },
  {
    number: "02",
    eyebrow: "LangGraph · Give it decisions",
    title: "Design agents that choose what happens next.",
    copy: "Create branching workflows, safe loops, parallel paths, human approval and persistent state—the architecture behind serious agentic products.",
    accent: "violet",
    icon: GitBranch,
    beats: ["Conditional paths", "Memory + streaming", "Human approval"],
    outcome: "Build a multi-step agent that plans, checks and recovers.",
  },
  {
    number: "03",
    eyebrow: "Evaluation · Make it dependable",
    title: "Know when your AI is actually good—not just impressive.",
    copy: "Test retrieval, score answers, compare models, inspect failures and add safety checks so your projects become trustworthy, explainable systems.",
    accent: "amber",
    icon: SearchCheck,
    beats: ["Evaluation rubrics", "RAG quality", "Agent safety"],
    outcome: "Build an evaluation studio that proves what works and why.",
  },
] as const;

const builderUpgrades = [
  {
    icon: Workflow,
    title: "Think in systems",
    text: "Move beyond one-off prompts and understand how intelligent products are designed end to end.",
  },
  {
    icon: Bot,
    title: "Build real agents",
    text: "Create workflows that retrieve information, use tools, make decisions and ask for human approval.",
  },
  {
    icon: ShieldCheck,
    title: "Make AI trustworthy",
    text: "Learn to test quality, catch weak outputs and explain why one system performs better than another.",
  },
] as const;

function AgentCore({ reducedMotion }: { reducedMotion: boolean | null }) {
  return (
    <div className={styles.coreStage} aria-hidden="true">
      <div className={styles.coreGlow} />
      <div className={`${styles.orbitRing} ${styles.orbitRingOuter}`} />
      <div className={`${styles.orbitRing} ${styles.orbitRingInner}`} />
      <div className={styles.coreSphere}>
        <motion.div
          className={styles.coreMark}
          animate={reducedMotion ? undefined : { rotate: [0, 6, -5, 0], scale: [1, 1.04, 0.99, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Orbit />
        </motion.div>
        <span>AGENT</span>
        <small>ONLINE</small>
      </div>
      <div className={`${styles.orbitChip} ${styles.orbitChipMemory}`}>
        <span /> Memory
      </div>
      <div className={`${styles.orbitChip} ${styles.orbitChipTools}`}>
        <span /> Tools
      </div>
      <div className={`${styles.orbitChip} ${styles.orbitChipReason}`}>
        <span /> Reason
      </div>
    </div>
  );
}

function ChapterVisual({ chapterIndex }: { chapterIndex: number }) {
  if (chapterIndex === 0) {
    return (
      <div className={styles.chainVisual} aria-hidden="true">
        {[
          ["01", "ASK"],
          ["02", "RETRIEVE"],
          ["03", "THINK"],
          ["04", "ACT"],
        ].map(([number, label], index) => (
          <div className={styles.chainNode} key={label}>
            <span>{number}</span>
            <strong>{label}</strong>
            {index < 3 ? <i /> : null}
          </div>
        ))}
      </div>
    );
  }

  if (chapterIndex === 1) {
    return (
      <div className={styles.graphVisual} aria-hidden="true">
        <div className={`${styles.graphNode} ${styles.graphStart}`}>GOAL</div>
        <div className={`${styles.graphNode} ${styles.graphPlan}`}>PLAN</div>
        <div className={`${styles.graphNode} ${styles.graphTool}`}>TOOL</div>
        <div className={`${styles.graphNode} ${styles.graphCheck}`}>CHECK</div>
        <div className={`${styles.graphNode} ${styles.graphHuman}`}>HUMAN</div>
        <svg viewBox="0 0 520 350" role="presentation">
          <path d="M108 175 C155 175 150 80 220 80" />
          <path d="M108 175 C155 175 150 270 220 270" />
          <path d="M290 80 C370 80 330 175 410 175" />
          <path d="M290 270 C370 270 330 175 410 175" />
          <path className={styles.graphLoop} d="M445 145 C490 62 330 22 255 65" />
        </svg>
        <div className={styles.graphPulse} />
      </div>
    );
  }

  return (
    <div className={styles.evalVisual} aria-hidden="true">
      <div className={styles.evalRing}>
        <div className={styles.evalRingInner}>
          <strong>92</strong>
          <span>QUALITY</span>
        </div>
      </div>
      <div className={`${styles.evalMetric} ${styles.evalMetricOne}`}>
        <span>RELEVANCE</span><strong>96%</strong>
      </div>
      <div className={`${styles.evalMetric} ${styles.evalMetricTwo}`}>
        <span>GROUNDING</span><strong>91%</strong>
      </div>
      <div className={`${styles.evalMetric} ${styles.evalMetricThree}`}>
        <span>SAFETY</span><strong>PASS</strong>
      </div>
    </div>
  );
}

export function LevelTwoStory({ firstName }: { firstName: string }) {
  const storyRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 110, damping: 24, mass: 0.32 });
  const ambientY = useTransform(smoothProgress, [0, 1], [0, -220]);
  const ambientRotate = useTransform(smoothProgress, [0, 1], [0, 32]);

  return (
    <main ref={storyRef} className={styles.story}>
      <motion.div
        className={styles.ambientWorld}
        style={reducedMotion ? undefined : { y: ambientY, rotate: ambientRotate }}
        aria-hidden="true"
      />
      <div className={styles.noise} aria-hidden="true" />
      <motion.div className={styles.scrollProgress} style={{ scaleX: smoothProgress }} />

      <nav className={styles.storyNav} aria-label="Level 2 story navigation">
        <Link href="/dashboard" className={styles.backLink}>
          <ArrowLeft /> <span>Dashboard</span>
        </Link>
        <span className={styles.navSignal}><i /> LEVEL 2 PREVIEW</span>
        <Link href="/chat" className={styles.navCta}>Talk to mentor <MessageCircle /></Link>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <motion.div
            className={styles.eyebrow}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.65 }}
          >
            <Sparkles /> Your next chapter is ready
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.08 }}
          >
            You taught AI to <em>answer.</em>
            <span>Now teach it to act.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : 0.2 }}
          >
            {firstName}, Level 1 made you an AI creator. Level 2 turns you into an agentic AI builder—someone who can design systems that remember, reason, use tools and improve.
          </motion.p>
          <motion.div
            className={styles.heroActions}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.38 }}
          >
            <a href="#chapter-one" className={styles.primaryAction}>
              Enter the story <ArrowDown />
            </a>
            <span>3 modules · 24 sessions · 96 build missions</span>
          </motion.div>
        </div>

        <motion.div
          className={styles.heroVisual}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reducedMotion ? 0 : 1, delay: reducedMotion ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <AgentCore reducedMotion={reducedMotion} />
        </motion.div>

        <div className={styles.scrollHint} aria-hidden="true">
          <span>SCROLL TO EVOLVE</span><i />
        </div>
      </section>

      <section className={styles.threshold}>
        <motion.div
          initial={{ opacity: 0, y: 45 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: reducedMotion ? 0 : 0.75 }}
        >
          <span>THE SHIFT</span>
          <p>Level 1 asks, “What can AI create?”</p>
          <h2>Level 2 asks, “What can I make AI do—reliably?”</h2>
        </motion.div>
      </section>

      <div className={styles.chapterStack}>
        {chapters.map((chapter, index) => {
          const Icon = chapter.icon;
          return (
            <section
              id={index === 0 ? "chapter-one" : undefined}
              className={`${styles.chapter} ${styles[`chapter_${chapter.accent}`]}`}
              key={chapter.number}
            >
              <motion.div
                className={styles.chapterCard}
                initial={{ opacity: 0, y: 70, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: reducedMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.chapterCopy}>
                  <div className={styles.chapterLabel}>
                    <span>{chapter.number}</span>
                    <Icon />
                    <p>{chapter.eyebrow}</p>
                  </div>
                  <h2>{chapter.title}</h2>
                  <p>{chapter.copy}</p>
                  <ul>
                    {chapter.beats.map((beat) => (
                      <li key={beat}><CheckCircle2 /> {beat}</li>
                    ))}
                  </ul>
                  <div className={styles.chapterOutcome}>
                    <span>YOUR BUILD</span>
                    <strong>{chapter.outcome}</strong>
                  </div>
                </div>
                <div className={styles.chapterVisual}>
                  <ChapterVisual chapterIndex={index} />
                </div>
              </motion.div>
            </section>
          );
        })}
      </div>

      <section className={styles.missionSection}>
        <motion.div
          className={styles.missionIntro}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: reducedMotion ? 0 : 0.7 }}
        >
          <span>NOT A LECTURE. A BUILD SEASON.</span>
          <h2>Every session moves from understanding to shipping.</h2>
          <p>Two guided class challenges and two home missions per session turn every idea into something you can test, improve and proudly explain.</p>
        </motion.div>
        <div className={styles.metricGrid}>
          {[
            ["3", "advanced modules"],
            ["24", "guided sessions"],
            ["96", "hands-on missions"],
            ["3", "showcase builds"],
          ].map(([value, label], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : index * 0.08 }}
            >
              <strong>{value}</strong><span>{label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className={styles.upgradeSection}>
        <div className={styles.upgradeHeader}>
          <span>WHAT CHANGES IN YOU</span>
          <h2>The tools are new. The real upgrade is how you think.</h2>
        </div>
        <div className={styles.upgradeGrid}>
          {builderUpgrades.map(({ icon: Icon, title, text }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 38 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: reducedMotion ? 0 : 0.55, delay: reducedMotion ? 0 : index * 0.1 }}
            >
              <span><Icon /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className={styles.finalSection}>
        <div className={styles.finalHalo} aria-hidden="true" />
        <motion.div
          className={styles.finalCard}
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: reducedMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.finalSignal}><i /> INVITATION OPEN</div>
          <Sparkles className={styles.finalSpark} />
          <h2>Ready to stop using AI like everyone else?</h2>
          <p>Take the next step and start building the intelligent systems other people will want to use.</p>
          <div className={styles.finalActions}>
            <Link href="/chat" className={styles.finalPrimary}>
              I&apos;m interested in Level 2 <ArrowRight />
            </Link>
            <Link href="/curriculum?level=2" className={styles.finalSecondary}>
              Preview the curriculum
            </Link>
          </div>
          <small>Nothing changes automatically. Your mentor will help you choose the right starting session.</small>
        </motion.div>
      </section>
    </main>
  );
}

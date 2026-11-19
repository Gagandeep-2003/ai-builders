"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  GitBranch,
  MessageCircle,
  Orbit,
  SearchCheck,
  Sparkles,
} from "lucide-react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "framer-motion";
import styles from "./level-two-story.module.css";

const LevelTwoWorld = dynamic(
  () => import("./level-two-world").then((module) => module.LevelTwoWorld),
  {
    ssr: false,
    loading: () => (
      <div className={styles.worldLoading}>
        <span><Orbit /></span>
        <small>INITIALISING WORLD</small>
      </div>
    ),
  },
);

const worlds = [
  {
    id: "memory-world",
    number: "01",
    signal: "MEMORY WORLD",
    eyebrow: "LANGCHAIN · MODULE ONE",
    title: "Give intelligence a memory.",
    story: "A prompt disappears after it is answered. A system remembers. You connect models, documents, retrieval and tools until separate abilities behave like one intelligent mind.",
    proof: ["Context that survives", "Knowledge it can retrieve", "Tools it knows when to use"],
    outcome: "Build an assistant that searches knowledge, remembers context and acts.",
    color: "mint",
    icon: BrainCircuit,
    align: "right",
  },
  {
    id: "decision-world",
    number: "02",
    signal: "DECISION DIMENSION",
    eyebrow: "LANGGRAPH · MODULE TWO",
    title: "Teach intelligence to choose.",
    story: "Now the world branches. Your agent can plan, take a path, call a tool, ask a human, recover from failure and continue—without losing where it is.",
    proof: ["Branching decisions", "Safe loops and recovery", "Human approval when it matters"],
    outcome: "Build an agent that plans, checks its work and changes course.",
    color: "violet",
    icon: GitBranch,
    align: "left",
  },
  {
    id: "trust-horizon",
    number: "03",
    signal: "TRUST HORIZON",
    eyebrow: "EVALUATION · MODULE THREE",
    title: "Prove intelligence deserves trust.",
    story: "Impressive is not enough. You test retrieval, score answers, compare models and reveal failure patterns—until you can explain exactly why your system works.",
    proof: ["Quality you can measure", "Weaknesses you can diagnose", "Safety you can demonstrate"],
    outcome: "Build an evaluation studio that turns opinions into evidence.",
    color: "amber",
    icon: SearchCheck,
    align: "right",
  },
] as const;

const outcomes = [
  ["REMEMBER", "Build with context, memory and knowledge—not isolated prompts."],
  ["DECIDE", "Design systems that choose paths, use tools and recover."],
  ["VERIFY", "Measure quality and make AI safer, clearer and dependable."],
] as const;

export function LevelTwoStory({ firstName }: { firstName: string }) {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 95, damping: 25, mass: 0.34 });
  const [activeWorld, setActiveWorld] = useState("00");

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const nextWorld = progress < 0.19 ? "00" : progress < 0.39 ? "01" : progress < 0.56 ? "02" : progress < 0.74 ? "03" : "∞";
    setActiveWorld((current) => current === nextWorld ? current : nextWorld);
  });

  return (
    <main className={styles.story}>
      <div className={styles.worldLayer}>
        <LevelTwoWorld className={styles.worldCanvas} />
      </div>
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.chromaticEdge} aria-hidden="true" />
      <motion.div className={styles.scrollProgress} style={{ scaleX: smoothProgress }} />

      <nav className={styles.storyNav} aria-label="Level 2 story navigation">
        <Link href="/dashboard" className={styles.backLink}>
          <ArrowLeft /> <span>Dashboard</span>
        </Link>
        <span className={styles.navSignal}><i /> LEVEL 2 · WORLD {activeWorld}</span>
        <Link href="/chat" className={styles.navCta}>Talk to mentor <MessageCircle /></Link>
      </nav>

      <aside className={styles.worldRail} aria-label="Story chapters">
        <span>00</span>
        <i />
        <a href="#memory-world" className={activeWorld === "01" ? styles.railActive : undefined}>01</a>
        <a href="#decision-world" className={activeWorld === "02" ? styles.railActive : undefined}>02</a>
        <a href="#trust-horizon" className={activeWorld === "03" ? styles.railActive : undefined}>03</a>
        <i />
        <span>∞</span>
      </aside>

      <section className={styles.hero}>
        <motion.div
          className={styles.heroCopy}
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.eyebrow}><Sparkles /> LEVEL 2 TRANSMISSION RECEIVED</div>
          <h1>
            The world beyond
            <span>the prompt.</span>
          </h1>
          <p>
            {firstName}, you learned to make AI answer. Now cross into a world where it can <strong>remember, decide, use tools and prove its work.</strong>
          </p>
          <div className={styles.heroActions}>
            <a href="#memory-world" className={styles.primaryAction}>Enter the world <ArrowDown /></a>
            <span><i /> Scroll controls the journey</span>
          </div>
        </motion.div>

        <div className={styles.heroCoordinates} aria-hidden="true">
          <span>AGENTIC WORLD</span>
          <strong>00° / 24S / 96M</strong>
        </div>
        <div className={styles.heroChapter} aria-hidden="true">00</div>
      </section>

      <section className={styles.threshold} aria-label="The transition from Level 1 to Level 2">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: reducedMotion ? 0 : 0.8 }}
        >
          <span>LEAVE THE FLAT WORLD</span>
          <p>Level 1 taught you what AI can create.</p>
          <h2>Level 2 reveals how intelligent systems actually come alive.</h2>
        </motion.div>
      </section>

      {worlds.map((world) => {
        const Icon = world.icon;
        return (
          <section
            id={world.id}
            key={world.id}
            className={`${styles.scene} ${world.align === "right" ? styles.sceneRight : styles.sceneLeft} ${styles[`scene_${world.color}`]}`}
          >
            <div className={styles.sceneAtmosphere} aria-hidden="true">
              <span>{world.signal}</span>
              <strong>{world.number}</strong>
            </div>
            <motion.article
              className={styles.sceneCopy}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 70, filter: "blur(14px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.36 }}
              transition={{ duration: reducedMotion ? 0 : 0.95, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.sceneSignal}><span>{world.number}</span><Icon /> {world.eyebrow}</div>
              <h2>{world.title}</h2>
              <p>{world.story}</p>
              <ul>
                {world.proof.map((item) => <li key={item}><CheckCircle2 /> {item}</li>)}
              </ul>
              <div className={styles.sceneOutcome}>
                <span>WHAT YOU SHIP</span>
                <strong>{world.outcome}</strong>
              </div>
            </motion.article>
          </section>
        );
      })}

      <section className={styles.transformation}>
        <motion.div
          className={styles.transformationIntro}
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reducedMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>THE BUILDER YOU BECOME</span>
          <h2>You stop using AI.<br />You start directing intelligence.</h2>
        </motion.div>
        <div className={styles.orbitingOutcomes}>
          {outcomes.map(([title, text], index) => (
            <motion.div
              key={title}
              className={styles.outcome}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.65 }}
              transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : index * 0.13 }}
            >
              <span>0{index + 1}</span>
              <strong>{title}</strong>
              <p>{text}</p>
            </motion.div>
          ))}
        </div>
        <div className={styles.transformationStats}>
          <span><strong>3</strong> advanced worlds</span>
          <span><strong>24</strong> guided sessions</span>
          <span><strong>96</strong> build missions</span>
        </div>
      </section>

      <section className={styles.finalSection}>
        <motion.div
          className={styles.finalCopy}
          initial={{ opacity: 0, y: 45, scale: 0.94 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: reducedMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.finalSignal}><i /> PORTAL OPEN · INVITATION READY</div>
          <h2>Ready to build what other people only imagine?</h2>
          <p>Step into Level 2 and turn your AI curiosity into intelligent systems you can demonstrate, defend and proudly call your own.</p>
          <div className={styles.finalActions}>
            <Link href="/chat" className={styles.finalPrimary}>I&apos;m ready for Level 2 <ArrowRight /></Link>
            <Link href="/curriculum?level=2" className={styles.finalSecondary}>Explore all 24 sessions</Link>
          </div>
          <small>Nothing changes automatically. Your mentor helps you choose the right starting session.</small>
        </motion.div>
      </section>
    </main>
  );
}

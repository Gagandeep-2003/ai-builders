"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
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
import BlurText from "@/components/effects/blur-text";
import TextLoop from "@/components/effects/text-loop";
import styles from "./level-two-story.module.css";

const ElectricLogo = dynamic(() => import("@/components/effects/electric-logo"), {
  ssr: false,
});

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
        <span className={styles.navSignal}>
          <Image src="/level-two-agentic-mark.svg" alt="" width={22} height={22} aria-hidden="true" />
          <i /> LEVEL 2 · WORLD {activeWorld}
        </span>
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
        <div className={styles.heroIdentity} aria-hidden="true">
          <div className={styles.heroLoop}>
            <TextLoop
              text="REMEMBER · DECIDE · BUILD · VERIFY"
              shape="circle"
              speed={42}
              separator="✦"
              curviness={145}
              tilt={-10}
              fontSize={29}
              fontWeight={800}
              letterSpacing={2.8}
              color="#b9ffe9"
              ribbon={false}
              pauseOnHover={false}
              scrollBoost={0.12}
              outline
              outlineWidth={1.25}
            />
          </div>
          <div className={styles.electricMark}>
            <ElectricLogo
              src="/level-two-agentic-mark.svg"
              color="#f3fffb"
              glowColor="#8b5cf6"
              scale={0.56}
              intensity={0.62}
              glow={0.62}
              thickness={1.05}
              strands={3}
              bend={0.58}
              crackle={1.2}
              arcs={1}
              flicker={0.32}
              fill={0}
              speed={1.8}
              interactive
              cursorIntensity={0.7}
              cursorRadius={110}
              theme="dark"
            />
          </div>
          <span className={styles.identityLabel}>AGENTIC SYSTEM ONLINE</span>
        </div>

        <motion.div
          className={styles.heroCopy}
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.eyebrow}><Sparkles /> LEVEL 2 TRANSMISSION RECEIVED</div>
          <div className={styles.heroTitle} role="heading" aria-level={1} aria-label="The world beyond the prompt.">
            <BlurText
              text="The world beyond"
              effect="drift"
              animateBy="words"
              direction="left"
              trigger="load"
              delay={105}
              stepDuration={0.52}
              blur={16}
              distance={70}
              color="#f7f8fb"
              fromColor="#6ee7b7"
              className={styles.heroHeadline}
            />
            <BlurText
              text="the prompt."
              effect="focus"
              animateBy="words"
              trigger="load"
              delay={120}
              stepDuration={0.68}
              blur={20}
              distance={0}
              color="#8cebd2"
              fromColor="#a78bfa"
              className={styles.heroHeadlineAccent}
            />
          </div>
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
          <div className={styles.thresholdTitle} role="heading" aria-level={2}>
            <BlurText
              text="Level 2 reveals how intelligent systems actually come alive."
              effect="focus"
              animateBy="words"
              trigger="view"
              delay={52}
              stepDuration={0.42}
              blur={18}
              distance={0}
              color="#f7f8fb"
              fromColor="#69ddff"
            />
          </div>
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
              <div className={styles.sceneTitle} role="heading" aria-level={2}>
                <BlurText
                  text={world.title}
                  effect={world.color === "violet" ? "tilt" : world.color === "amber" ? "focus" : "drift"}
                  animateBy="words"
                  direction={world.align === "right" ? "right" : "left"}
                  trigger="view"
                  delay={85}
                  stepDuration={0.45}
                  blur={15}
                  distance={56}
                  color="currentColor"
                  fromColor={world.color === "mint" ? "#6ee7b7" : world.color === "violet" ? "#a78bfa" : "#ffbd67"}
                />
              </div>
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
          <div className={styles.transformationTitle} role="heading" aria-level={2}>
            <BlurText
              text="You stop using AI. You start directing intelligence."
              effect="zoom"
              animateBy="words"
              trigger="view"
              delay={72}
              stepDuration={0.46}
              blur={17}
              distance={42}
              color="#f7f8fb"
              fromColor="#a78bfa"
            />
          </div>
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
          <div className={styles.finalTitle} role="heading" aria-level={2}>
            <BlurText
              text="Ready to build what other people only imagine?"
              effect="focus"
              animateBy="words"
              trigger="view"
              delay={68}
              stepDuration={0.46}
              blur={20}
              distance={0}
              color="#f7f8fb"
              fromColor="#6ee7b7"
            />
          </div>
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

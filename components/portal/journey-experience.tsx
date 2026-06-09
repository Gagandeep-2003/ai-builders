"use client";

import { useCallback, useId, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Orbit, Sparkles, Trophy } from "lucide-react";
import type { CourseModule, CourseSession, StudentProfile } from "@/lib/course-data";
import type { CurriculumSession } from "@/lib/data";
import { cn } from "@/lib/utils";

type JourneyExperienceProps = {
  student: StudentProfile;
  modules: CourseModule[];
  sessions: CurriculumSession[];
  completedCount: number;
  nextSession?: CourseSession;
};

type ElectricBorderProps = {
  children: ReactNode;
  color?: string;
  speed?: number;
  chaos?: number;
  borderRadius?: number;
  className?: string;
  style?: CSSProperties;
};

const moduleVisuals = [
  {
    accent: "#6ee7b7",
    glow: "rgba(110,231,183,0.28)",
    mood: "Prompt craft, study systems, creative AI, and a confident showcase.",
    image:
      "radial-gradient(circle at 22% 20%, rgba(110,231,183,0.95), transparent 18%), linear-gradient(145deg, #132f2a, #12121b 62%, #2b1d48)",
  },
  {
    accent: "#60a5fa",
    glow: "rgba(96,165,250,0.26)",
    mood: "Design screens, vibe-code apps, test AI features, and ship a capstone.",
    image:
      "radial-gradient(circle at 76% 22%, rgba(96,165,250,0.92), transparent 20%), linear-gradient(145deg, #101d3f, #12121b 58%, #3b2340)",
  },
  {
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.25)",
    mood: "Agents, workflows, Zapier, n8n, ClawBot, and smart automation demos.",
    image:
      "radial-gradient(circle at 25% 74%, rgba(245,158,11,0.9), transparent 18%), linear-gradient(145deg, #33220e, #12121b 56%, #14372e)",
  },
];

const avatarSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="#6ee7b7"/>
      <stop offset="0.52" stop-color="#60a5fa"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
    <radialGradient id="r" cx="35%" cy="20%" r="75%">
      <stop stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="0.42" stop-color="#ffffff" stop-opacity="0.08"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="240" height="240" rx="48" fill="#111118"/>
  <circle cx="120" cy="94" r="48" fill="url(#g)"/>
  <path d="M44 218c12-48 43-75 76-75s64 27 76 75" fill="url(#g)" opacity="0.92"/>
  <rect width="240" height="240" rx="48" fill="url(#r)"/>
  <path d="M52 54c34-29 72-38 116-19" fill="none" stroke="#fff" stroke-opacity=".24" stroke-width="8" stroke-linecap="round"/>
</svg>
`);

function getModuleSessions(sessions: CurriculumSession[], moduleId: string) {
  return sessions.filter((session) => session.moduleId === moduleId);
}

function getModuleProgress(sessions: CurriculumSession[], moduleId: string) {
  const moduleSessions = getModuleSessions(sessions, moduleId);
  const completed = moduleSessions.filter((session) => session.status === "completed").length;
  return {
    completed,
    total: moduleSessions.length || 8,
  };
}

function ElectricBorder({
  children,
  color = "#7df9ff",
  speed = 1,
  chaos = 0.12,
  borderRadius = 24,
  className,
  style,
}: ElectricBorderProps) {
  const filterId = useId().replace(/:/g, "");
  const duration = `${Math.max(0.75, 3 / Math.max(speed, 0.1))}s`;

  return (
    <div
      className={cn("electric-border", className)}
      style={
        {
          "--electric-color": color,
          "--electric-radius": `${borderRadius}px`,
          "--electric-duration": duration,
          ...style,
        } as CSSProperties
      }
    >
      <svg className="electric-border-svg" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency={chaos}
              numOctaves="2"
              seed="7"
              result="noise"
            >
              <animate
                attributeName="seed"
                values="7;19;43;11;7"
                dur={duration}
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" />
          </filter>
        </defs>
        <rect
          x="6"
          y="6"
          width="calc(100% - 12px)"
          height="calc(100% - 12px)"
          rx={borderRadius}
          pathLength="100"
          filter={`url(#${filterId})`}
        />
      </svg>
      <div className="electric-border-glow" />
      <div className="electric-border-content">{children}</div>
    </div>
  );
}

function JourneyProfileCard({ student }: { student: StudentProfile }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const handle = student.email.split("@")[0] || student.fullName.toLowerCase().replace(/\s+/g, ".");

  const setPointerVars = useCallback((clientX: number, clientY: number) => {
    const shell = shellRef.current;
    if (!shell) return;

    const rect = shell.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    const rotateX = ((percentY - 50) / -7).toFixed(2);
    const rotateY = ((percentX - 50) / 7).toFixed(2);

    shell.style.setProperty("--profile-x", `${percentX}%`);
    shell.style.setProperty("--profile-y", `${percentY}%`);
    shell.style.setProperty("--profile-rotate-x", `${rotateX}deg`);
    shell.style.setProperty("--profile-rotate-y", `${rotateY}deg`);
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      setPointerVars(event.clientX, event.clientY);
    },
    [setPointerVars],
  );

  const handlePointerLeave = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;

    shell.style.setProperty("--profile-x", "50%");
    shell.style.setProperty("--profile-y", "38%");
    shell.style.setProperty("--profile-rotate-x", "0deg");
    shell.style.setProperty("--profile-rotate-y", "0deg");
  }, []);

  return (
    <ElectricBorder color="#7df9ff" speed={1.15} chaos={0.08} borderRadius={24}>
      <div
        ref={shellRef}
        className="journey-profile-shell"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <section className="journey-profile-card">
          <div className="journey-profile-shine" />
          <div className="journey-profile-pattern" />
          <div className="journey-profile-avatar-wrap">
            <div
              aria-hidden="true"
              className="journey-profile-avatar"
              style={{ backgroundImage: `url("data:image/svg+xml,${avatarSvg}")` }}
            />
          </div>

          <div className="journey-profile-heading">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-cyan-100/80">
              Journey passport
            </p>
            <h2>{student.fullName}</h2>
            <p>AI Builder</p>
          </div>

          <div className="journey-profile-userbar">
            <div className="flex min-w-0 items-center gap-3">
              <div
                aria-hidden="true"
                className="h-10 w-10 shrink-0 rounded-full border border-white/15 bg-cover bg-center"
                style={{ backgroundImage: `url("data:image/svg+xml,${avatarSvg}")` }}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-text-primary">@{handle}</p>
                <p className="truncate text-xs text-cyan-100/70">Online in course journey</p>
              </div>
            </div>
            <a
              href="/progress"
              className="button-motion rounded-full border border-white/15 bg-white/12 px-3 py-2 text-xs font-bold text-text-primary hover:border-cyan-200/50"
            >
              Progress
            </a>
          </div>
        </section>
      </div>
    </ElectricBorder>
  );
}

export function JourneyExperience({
  student,
  modules,
  sessions,
  completedCount,
  nextSession,
}: JourneyExperienceProps) {
  const [activeModuleId, setActiveModuleId] = useState(modules[0]?.id ?? "");
  const activeIndex = Math.max(0, modules.findIndex((module) => module.id === activeModuleId));
  const activeModule = modules[activeIndex] ?? modules[0];
  const activeVisual = moduleVisuals[activeIndex % moduleVisuals.length];
  const activeSessions = useMemo(
    () => getModuleSessions(sessions, activeModule?.id ?? ""),
    [activeModule?.id, sessions],
  );
  const totalSessions = sessions.length || 24;
  const journeyPercent = Math.round((completedCount / totalSessions) * 100);

  return (
    <div className="space-y-8">
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="premium-card rounded-xl p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase text-accent">Student journey</p>
              <h1 className="mt-3 max-w-3xl font-heading text-4xl font-black leading-tight md:text-5xl">
                Explore your AI builder path
              </h1>
              <p className="mt-4 max-w-2xl text-text-secondary">
                A playful map of what you are learning, what you have unlocked, and what comes next across the course.
              </p>
            </div>
            <div className="rounded-xl border border-accent/25 bg-accent/10 px-4 py-3 font-mono text-sm text-accent">
              {completedCount}/{totalSessions} sessions
            </div>
          </div>

          <div className="mt-8 h-3 overflow-hidden rounded-full border border-border bg-bg-elevated">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent via-info to-accent-warm"
              initial={{ width: 0 }}
              animate={{ width: `${journeyPercent}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Progress", `${journeyPercent}%`, Trophy],
              ["Next", nextSession?.title ?? "Showcase", ArrowRight],
              ["Focus", activeModule?.title ?? "AI Builders", Sparkles],
            ].map(([label, value, Icon]) => (
              <div key={String(label)} className="rounded-xl border border-border/70 bg-white/[0.025] p-4">
                <Icon className="h-5 w-5 text-accent" />
                <p className="mt-3 font-mono text-xs uppercase text-text-muted">{String(label)}</p>
                <p className="mt-1 line-clamp-2 font-heading font-bold">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>

        <JourneyProfileCard student={student} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="premium-card rounded-xl p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase text-accent">Infinite menu</p>
              <h2 className="mt-2 font-heading text-2xl font-bold">Choose a world</h2>
            </div>
            <Orbit className="h-6 w-6 text-accent" />
          </div>

          <div className="relative mt-8 aspect-square max-h-[480px] overflow-hidden rounded-xl border border-border bg-bg-elevated">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(110,231,183,0.14),transparent_34%),radial-gradient(circle_at_70%_20%,rgba(96,165,250,0.12),transparent_30%)]" />
            <motion.div
              className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-accent/25"
              animate={{ rotate: 360 }}
              transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
            />
            {modules.map((module, index) => {
              const angle = (index / modules.length) * Math.PI * 2 - Math.PI / 2;
              const x = 50 + Math.cos(angle) * 33;
              const y = 50 + Math.sin(angle) * 33;
              const visual = moduleVisuals[index % moduleVisuals.length];
              const progress = getModuleProgress(sessions, module.id);
              const selected = module.id === activeModule?.id;

              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModuleId(module.id)}
                  className={cn(
                    "button-motion absolute w-36 -translate-x-1/2 -translate-y-1/2 rounded-xl border p-3 text-left shadow-2xl backdrop-blur",
                    selected
                      ? "border-accent/50 bg-accent/15"
                      : "border-border bg-bg-card/80 hover:border-accent/30",
                  )}
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <span
                    className="mb-3 block h-16 rounded-lg border border-white/10"
                    style={{ background: visual.image, boxShadow: selected ? `0 0 34px ${visual.glow}` : undefined }}
                  />
                  <span className="font-mono text-[0.65rem] uppercase text-accent">Module {module.orderIndex}</span>
                  <span className="mt-1 line-clamp-2 block text-sm font-bold">{module.title}</span>
                  <span className="mt-2 block text-xs text-text-muted">{progress.completed}/{progress.total} unlocked</span>
                </button>
              );
            })}
            <div className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-accent/30 bg-bg-base/80 text-center backdrop-blur">
              <BookOpen className="h-6 w-6 text-accent" />
              <p className="mt-1 font-mono text-[0.6rem] uppercase text-text-muted">Course map</p>
            </div>
          </div>
        </div>

        <div className="premium-card rounded-xl p-6">
          <p className="font-mono text-xs uppercase text-accent">Flying posters</p>
          <h2 className="mt-2 font-heading text-2xl font-bold">{activeModule?.title}</h2>
          <p className="mt-3 text-text-secondary">{activeVisual?.mood}</p>

          <div className="journey-poster-stage mt-6">
            <div className="journey-poster-track">
              {[...activeSessions, ...activeSessions].map((session, index) => (
                <article
                  key={`${session.id}-${index}`}
                  className={cn(
                    "journey-poster-card",
                    session.status === "completed" && "journey-poster-complete",
                    session.status === "current" && "journey-poster-current",
                  )}
                  style={{ background: activeVisual?.image }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/45 to-transparent" />
                  <div className="relative mt-auto">
                    <p className="font-mono text-[0.65rem] uppercase text-accent">Session {session.sessionNumber}</p>
                    <h3 className="mt-2 line-clamp-2 font-heading text-lg font-black">{session.title}</h3>
                    <p className="mt-3 line-clamp-3 text-xs text-text-secondary">{session.focus}</p>
                    <span className="mt-4 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 font-mono text-[0.62rem] uppercase">
                      {session.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="premium-card rounded-xl p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase text-accent">Experience timeline</p>
            <h2 className="mt-2 font-heading text-2xl font-bold">Your course arc</h2>
          </div>
          <p className="text-sm text-text-secondary">Built from the same sessions in your curriculum</p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {modules.map((module, index) => {
            const progress = getModuleProgress(sessions, module.id);
            const visual = moduleVisuals[index % moduleVisuals.length];
            return (
              <article key={module.id} className="rounded-xl border border-border/70 bg-white/[0.025] p-5">
                <div className="h-2 overflow-hidden rounded-full bg-bg-elevated">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((progress.completed / progress.total) * 100)}%`,
                      background: visual.accent,
                    }}
                  />
                </div>
                <p className="mt-5 font-mono text-xs uppercase text-accent">Module {module.orderIndex}</p>
                <h3 className="mt-2 font-heading text-xl font-bold">{module.title}</h3>
                <p className="mt-3 text-sm leading-6 text-text-secondary">{module.description}</p>
                <p className="mt-5 font-mono text-xs text-text-muted">
                  {progress.completed}/{progress.total} sessions completed
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

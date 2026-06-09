"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRightFromSquare,
  BookOpenCheck,
  ChevronRight,
  Expand,
  Layers3,
  LockKeyhole,
  MonitorPlay,
  Sparkles,
  X,
} from "lucide-react";
import type { CourseModule, ResourceItem } from "@/lib/course-data";
import { cn } from "@/lib/utils";

type ModuleDeck = {
  moduleNumber: number;
  title: string;
  status: "live" | "coming-soon";
  sessions: SessionDeck[];
};

type SessionDeck = {
  sessionNumber: number;
  title: string;
  embedUrl: string;
};

const moduleDecks: ModuleDeck[] = [
  {
    moduleNumber: 1,
    title: "Agentic AI Essentials: Prompts to Projects",
    status: "live",
    sessions: [
      { sessionNumber: 1, title: "Welcome to the AI Era", embedUrl: "https://www.canva.com/design/DAHKOZzhemU/view?embed" },
      { sessionNumber: 2, title: "AI for School: Study Smarter", embedUrl: "https://www.canva.com/design/DAHME3sC8F0/view?embed" },
      { sessionNumber: 3, title: "AI for Creative Writing", embedUrl: "https://www.canva.com/design/DAHME5kXegM/view?embed" },
      { sessionNumber: 4, title: "AI Image & Video Creation", embedUrl: "https://www.canva.com/design/DAHME1HUZp8/view?embed" },
      { sessionNumber: 5, title: "AI Audio Generation", embedUrl: "https://www.canva.com/design/DAHME8Kj_dw/view?embed" },
      { sessionNumber: 6, title: "AI for Task Organisation", embedUrl: "https://www.canva.com/design/DAHME6_r4ts/view?embed" },
      { sessionNumber: 7, title: "AI without Internet", embedUrl: "https://www.canva.com/design/DAHMEyqi7oo/view?embed" },
      { sessionNumber: 8, title: "AI Presentations & Showcase", embedUrl: "https://www.canva.com/design/DAHME0t1q0E/view?embed" },
    ],
  },
  {
    moduleNumber: 2,
    title: "Vibe Coding Lab: Idea to App",
    status: "coming-soon",
    sessions: [],
  },
  {
    moduleNumber: 3,
    title: "Automation Studio: Agents & Workflows",
    status: "coming-soon",
    sessions: [],
  },
];

function moduleTitleFromData(moduleNumber: number, modules: CourseModule[]) {
  return modules.find((item) => item.orderIndex === moduleNumber)?.title;
}

function ComingSoonPanel({ moduleNumber, title }: { moduleNumber: number; title: string }) {
  return (
    <div className="premium-card relative min-h-[420px] overflow-hidden rounded-xl p-6">
      <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.045),transparent)] animate-[resource-sweep_4s_ease-in-out_infinite]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
      <div className="relative grid min-h-[360px] place-items-center text-center">
        <div className="max-w-lg">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent shadow-[0_0_42px_rgba(110,231,183,0.12)]">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <p className="mt-7 font-mono text-xs uppercase tracking-[0.24em] text-accent">
            Module {moduleNumber} resource vault
          </p>
          <h3 className="mt-3 font-heading text-3xl font-bold text-text-primary">{title}</h3>
          <p className="mx-auto mt-4 max-w-md leading-7 text-text-secondary">
            This module space is ready. Once the Canva decks are shared, each session will unlock here as an embedded portal view.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Session decks", "Portal view", "Expandable reader"].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-text-secondary">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CanvaFrame({
  session,
  expanded = false,
}: {
  session: SessionDeck;
  expanded?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-bg-base shadow-[0_24px_80px_rgba(0,0,0,0.28)]",
        expanded ? "h-[min(86vh,860px)]" : "aspect-[16/10] min-h-[360px]",
      )}
    >
      <iframe
        title={`Module 1 Session ${session.sessionNumber}: ${session.title}`}
        src={session.embedUrl}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
        allow="fullscreen; clipboard-read; clipboard-write"
        allowFullScreen
      />
    </div>
  );
}

export function ResourceLibrary({
  resources,
  modules,
}: {
  resources: ResourceItem[];
  modules: CourseModule[];
}) {
  const [activeModule, setActiveModule] = useState(1);
  const [activeSession, setActiveSession] = useState(1);
  const [expandedSession, setExpandedSession] = useState<SessionDeck | null>(null);

  const selectedModule = moduleDecks.find((module) => module.moduleNumber === activeModule) ?? moduleDecks[0];
  const selectedSession =
    selectedModule.sessions.find((session) => session.sessionNumber === activeSession) ??
    selectedModule.sessions[0] ??
    null;

  const additionalResources = useMemo(
    () =>
      resources.filter((resource) => {
        const resourceModule = modules.find((item) => item.id === resource.moduleId);
        return resourceModule?.orderIndex === activeModule || resource.moduleId === `m${activeModule}`;
      }),
    [activeModule, modules, resources],
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {moduleDecks.map((module) => {
          const title = moduleTitleFromData(module.moduleNumber, modules) ?? module.title;
          const isActive = activeModule === module.moduleNumber;
          return (
            <button
              key={module.moduleNumber}
              onClick={() => {
                setActiveModule(module.moduleNumber);
                setActiveSession(1);
              }}
              className={cn(
                "premium-card premium-card-hover group min-h-40 rounded-xl p-5 text-left",
                isActive && "border-accent/55 bg-accent/10",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                  {module.status === "live" ? <MonitorPlay className="h-5 w-5" /> : <Layers3 className="h-5 w-5" />}
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary">
                  {module.status === "live" ? "Live" : "Coming soon"}
                </span>
              </div>
              <p className="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-accent">Module {module.moduleNumber}</p>
              <h3 className="mt-2 font-heading text-lg font-bold text-text-primary">{title}</h3>
              <p className="mt-3 text-sm text-text-secondary">
                {module.status === "live"
                  ? `${module.sessions.length} embedded session decks`
                  : "Session resources will unlock here"}
              </p>
            </button>
          );
        })}
      </section>

      {selectedModule.status === "coming-soon" ? (
        <ComingSoonPanel
          moduleNumber={selectedModule.moduleNumber}
          title={moduleTitleFromData(selectedModule.moduleNumber, modules) ?? selectedModule.title}
        />
      ) : (
        <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <BookOpenCheck className="h-4 w-4 text-accent" />
              Choose a session to open its embedded resource.
            </div>
            <div className="grid gap-2">
              {selectedModule.sessions.map((session) => (
                <button
                  key={session.sessionNumber}
                  onClick={() => setActiveSession(session.sessionNumber)}
                  className={cn(
                    "group flex min-h-16 items-center gap-3 rounded-xl border border-border bg-bg-card px-4 py-3 text-left transition hover:border-accent/35 hover:bg-accent/5",
                    activeSession === session.sessionNumber && "border-accent/50 bg-accent/10",
                  )}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.035] font-mono text-sm text-accent">
                    {session.sessionNumber}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-sm font-bold text-text-primary">
                      Session {session.sessionNumber}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-text-secondary">{session.title}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-accent" />
                </button>
              ))}
            </div>
          </div>

          <div className="premium-card rounded-xl p-4 sm:p-5">
            {selectedSession ? (
              <>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                      Module 1 · Session {selectedSession.sessionNumber}
                    </p>
                    <h3 className="mt-2 font-heading text-2xl font-bold text-text-primary">{selectedSession.title}</h3>
                    <p className="mt-2 text-sm text-text-secondary">
                      Embedded Canva resource. The source link is kept out of the interface.
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedSession(selectedSession)}
                    className="button-motion inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 text-sm font-bold text-accent"
                  >
                    <Expand className="h-4 w-4" />
                    Expand
                  </button>
                </div>
                <CanvaFrame session={selectedSession} />
              </>
            ) : null}
          </div>
        </section>
      )}

      {additionalResources.length > 0 ? (
        <section className="rounded-xl border border-border bg-bg-card/60 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h3 className="font-heading text-lg font-bold">Additional portal resources</h3>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {additionalResources.map((resource) => (
              <div key={resource.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-heading text-sm font-bold text-text-primary">{resource.title}</p>
                    <p className="mt-1 text-xs text-text-secondary">{resource.sessionName}</p>
                  </div>
                  <ArrowUpRightFromSquare className="h-4 w-4 text-text-muted" />
                </div>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">
                  {resource.type}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {expandedSession ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/78 p-3 backdrop-blur-md sm:p-6">
          <div className="w-full max-w-7xl">
            <div className="mb-3 flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-bg-card/95 px-4 py-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                  Expanded resource · Session {expandedSession.sessionNumber}
                </p>
                <h3 className="mt-1 font-heading text-lg font-bold text-text-primary">{expandedSession.title}</h3>
              </div>
              <button
                onClick={() => setExpandedSession(null)}
                className="button-motion grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-text-secondary hover:text-accent"
                aria-label="Close expanded resource"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <CanvaFrame session={expandedSession} expanded />
          </div>
        </div>
      ) : null}
    </div>
  );
}

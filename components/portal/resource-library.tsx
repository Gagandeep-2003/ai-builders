"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpenCheck,
  FileText,
  FolderOpen,
  Link2,
  PlaySquare,
} from "lucide-react";
import type { CourseModule, CourseSession, ResourceItem } from "@/lib/course-data";
import { cn } from "@/lib/utils";

const typeIcons = {
  link: Link2,
  pdf: FileText,
  video: PlaySquare,
  note: BookOpenCheck,
};

export function ResourceLibrary({
  resources,
  modules,
  sessions,
}: {
  resources: ResourceItem[];
  modules: CourseModule[];
  sessions: CourseSession[];
}) {
  const populatedModules = useMemo(
    () =>
      modules
        .map((module) => ({
          module,
          resources: resources.filter((resource) => resource.moduleId === module.id),
        }))
        .filter((entry) => entry.resources.length > 0),
    [modules, resources],
  );
  const [activeModuleId, setActiveModuleId] = useState(
    populatedModules[0]?.module.id ?? "",
  );
  const activeModule =
    populatedModules.find((entry) => entry.module.id === activeModuleId) ??
    populatedModules[0];
  const sessionById = useMemo(
    () => new Map(sessions.map((session) => [session.id, session])),
    [sessions],
  );
  const groupedResources = useMemo(() => {
    if (!activeModule) return [];

    const groups = new Map<string, ResourceItem[]>();
    for (const resource of activeModule.resources) {
      const key = resource.sessionId || "module";
      groups.set(key, [...(groups.get(key) ?? []), resource]);
    }

    return [...groups.entries()]
      .map(([sessionId, items]) => ({
        sessionId,
        session: sessionById.get(sessionId),
        items,
      }))
      .sort((a, b) => {
        if (!a.session) return -1;
        if (!b.session) return 1;
        return a.session.globalNumber - b.session.globalNumber;
      });
  }, [activeModule, sessionById]);

  if (resources.length === 0 || populatedModules.length === 0) {
    return (
      <section className="premium-card grid min-h-[360px] place-items-center rounded-xl p-8 text-center">
        <div className="max-w-md">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
            <FolderOpen className="h-6 w-6" />
          </span>
          <h2 className="mt-5 font-heading text-2xl font-bold">Resources are being prepared</h2>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            Your mentor has not published a resource for your unlocked sessions yet. New material will appear here automatically.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-soft">
        {populatedModules.map(({ module, resources: moduleResources }) => (
          <button
            key={module.id}
            type="button"
            onClick={() => setActiveModuleId(module.id)}
            className={cn(
              "button-motion min-w-fit rounded-lg border px-4 py-3 text-left",
              activeModule?.module.id === module.id
                ? "border-accent/45 bg-accent/10 text-accent"
                : "border-border bg-bg-card text-text-secondary hover:text-text-primary",
            )}
          >
            <span className="block font-mono text-[10px] uppercase tracking-[0.14em]">
              Module {module.orderIndex}
            </span>
            <span className="mt-1 block font-heading text-sm font-bold">{module.title}</span>
            <span className="mt-1 block text-xs opacity-75">
              {moduleResources.length} {moduleResources.length === 1 ? "resource" : "resources"}
            </span>
          </button>
        ))}
      </div>

      <section className="space-y-5">
        {groupedResources.map(({ sessionId, session, items }) => (
          <div key={sessionId}>
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase text-accent">
                  {session ? `Session ${session.sessionNumber}` : "Module resources"}
                </p>
                <h2 className="mt-1 font-heading text-xl font-bold">
                  {session?.title ?? activeModule?.module.title}
                </h2>
              </div>
              <p className="text-xs text-text-muted">{items.length} available</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((resource) => {
                const Icon = typeIcons[resource.type] ?? Link2;
                return (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="premium-card premium-card-hover group flex min-h-36 flex-col rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid h-10 w-10 place-items-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
                        <Icon className="h-4 w-4" />
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                    </div>
                    <h3 className="mt-4 font-heading text-lg font-bold">{resource.title}</h3>
                    <p className="mt-auto pt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted">
                      Open {resource.type}
                    </p>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

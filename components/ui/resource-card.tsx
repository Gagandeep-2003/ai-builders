import { ExternalLink, FileText, Link2, NotebookText, PlayCircle } from "lucide-react";
import type { ResourceItem } from "@/lib/course-data";

const icons = {
  pdf: FileText,
  link: Link2,
  video: PlayCircle,
  note: NotebookText,
};

export function ResourceCard({ resource }: { resource: ResourceItem }) {
  const Icon = icons[resource.type];
  const moduleLabel = /^m\d+$/i.test(resource.moduleId)
    ? resource.moduleId.replace("m", "Module ")
    : "Module";

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noreferrer"
      className="premium-card premium-card-hover group rounded-xl p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-xl border border-accent/20 bg-accent/10 p-3 text-accent">
          <Icon className="h-5 w-5" />
        </div>
        <ExternalLink className="h-4 w-4 text-text-muted transition group-hover:text-accent" />
      </div>
      <h3 className="mt-5 font-heading text-base font-bold">{resource.title}</h3>
      <p className="mt-2 text-sm text-text-secondary">{resource.sessionName}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-border bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] uppercase text-text-secondary">
          {moduleLabel}
        </span>
        <span className="rounded-full border border-border bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] uppercase text-text-secondary">
          {resource.type}
        </span>
      </div>
    </a>
  );
}

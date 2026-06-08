"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ResourceCard } from "@/components/ui/resource-card";
import type { CourseModule, ResourceItem, ResourceType } from "@/lib/course-data";
import { cn } from "@/lib/utils";

const types: Array<"all" | ResourceType> = ["all", "pdf", "link", "video", "note"];

export function ResourceLibrary({
  resources,
  modules,
}: {
  resources: ResourceItem[];
  modules: CourseModule[];
}) {
  const [query, setQuery] = useState("");
  const [module, setModule] = useState("all");
  const [type, setType] = useState<(typeof types)[number]>("all");

  const filtered = useMemo(
    () =>
      resources.filter((resource) => {
        const matchesQuery = resource.title.toLowerCase().includes(query.toLowerCase());
        const matchesModule = module === "all" || resource.moduleId === module;
        const matchesType = type === "all" || resource.type === type;
        return matchesQuery && matchesModule && matchesType;
      }),
    [resources, query, module, type],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row">
        <label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-border bg-bg-card px-4">
          <Search className="h-4 w-4 text-text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search resources"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto scrollbar-soft">
          {["all", ...modules.map((item) => item.id)].map((item) => (
            <button
              key={item}
              onClick={() => setModule(item)}
              className={cn(
                "min-w-fit rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm text-text-secondary",
                module === item && "border-accent/40 bg-accent/10 text-accent",
              )}
            >
              {item === "all"
                ? "All"
                : `M${modules.find((moduleItem) => moduleItem.id === item)?.orderIndex ?? ""}`}
            </button>
          ))}
          {types.map((item) => (
            <button
              key={item}
              onClick={() => setType(item)}
              className={cn(
                "min-w-fit rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm capitalize text-text-secondary",
                type === item && "border-accent/40 bg-accent/10 text-accent",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}

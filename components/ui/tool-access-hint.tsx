import { LockKeyhole } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToolAccessHint({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated/75 px-3 py-1.5 text-xs text-text-muted",
        className,
      )}
    >
      <LockKeyhole className="h-3.5 w-3.5 text-accent" />
      <span>Tools reveal when this session unlocks.</span>
    </div>
  );
}

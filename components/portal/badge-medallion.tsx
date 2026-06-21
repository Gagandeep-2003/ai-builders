import {
  Award,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Flame,
  Hammer,
  Layers3,
  Lightbulb,
  Presentation,
  Puzzle,
  Rocket,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import type { BadgeDefinition } from "@/lib/course-data";
import { cn } from "@/lib/utils";

const icons = {
  rocket: Rocket,
  "check-circle": CheckCircle2,
  flame: Flame,
  zap: Zap,
  hammer: Hammer,
  layers: Layers3,
  sparkles: Sparkles,
  brain: BrainCircuit,
  code: Code2,
  workflow: Workflow,
  presentation: Presentation,
  trophy: Trophy,
  lightbulb: Lightbulb,
  puzzle: Puzzle,
  "trending-up": TrendingUp,
  users: Users,
  star: Star,
};

export function BadgeMedallion({
  badge,
  earned = true,
  size = "md",
  className,
}: {
  badge: BadgeDefinition;
  earned?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = icons[badge.iconKey as keyof typeof icons] ?? Award;
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full border bg-bg-base",
        size === "sm" && "h-11 w-11",
        size === "md" && "h-16 w-16",
        size === "lg" && "h-24 w-24",
        !earned && "grayscale opacity-35",
        className,
      )}
      style={{
        borderColor: `${badge.color}88`,
        color: badge.color,
        boxShadow: earned ? `0 0 28px ${badge.color}24, inset 0 0 18px ${badge.color}18` : undefined,
      }}
    >
      <span className="absolute inset-[5px] rounded-full border border-white/10" />
      <Icon className={cn(size === "sm" && "h-4 w-4", size === "md" && "h-6 w-6", size === "lg" && "h-10 w-10")} />
    </span>
  );
}

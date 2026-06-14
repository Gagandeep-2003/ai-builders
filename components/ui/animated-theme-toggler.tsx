"use client";

import { Moon, Sun } from "lucide-react";
import type { MouseEvent } from "react";
import { useTheme } from "@/components/ui/theme-provider";
import { cn } from "@/lib/utils";

type TransitionVariant = "circle" | "square" | "diamond" | "rectangle";

type AnimatedThemeTogglerProps = {
  className?: string;
  duration?: number;
  variant?: TransitionVariant;
  fromCenter?: boolean;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> };
};

function getShape(variant: TransitionVariant, radius: number, x: number, y: number) {
  if (variant === "square") return ["inset(50% round 18px)", "inset(0% round 18px)"];
  if (variant === "rectangle") return ["inset(48% 44% round 18px)", "inset(0% round 18px)"];
  if (variant === "diamond") {
    return [
      `polygon(${x}px ${y}px, ${x}px ${y}px, ${x}px ${y}px, ${x}px ${y}px)`,
      `polygon(${x}px -${radius}px, ${window.innerWidth + radius}px ${y}px, ${x}px ${window.innerHeight + radius}px, -${radius}px ${y}px)`,
    ];
  }
  return [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`];
}

export function AnimatedThemeToggler({
  className,
  duration = 520,
  variant = "circle",
  fromCenter = false,
}: AnimatedThemeTogglerProps) {
  const { theme, setTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    const doc = document as ViewTransitionDocument;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = fromCenter ? window.innerWidth / 2 : rect.left + rect.width / 2;
    const y = fromCenter ? window.innerHeight / 2 : rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    if (!doc.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    const transition = doc.startViewTransition(() => setTheme(nextTheme));
    void transition.ready.then(() => {
      const [from, to] = getShape(variant, radius, x, y);
      document.documentElement.animate(
        { clipPath: [from, to] },
        {
          duration,
          easing: "cubic-bezier(.22,1,.36,1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "button-motion group flex w-full items-center justify-between rounded-xl border border-border bg-bg-card px-3 py-2.5 text-sm text-text-secondary hover:border-accent/35 hover:text-text-primary",
        className,
      )}
      aria-label={`Switch to ${nextTheme} mode`}
    >
      <span className="inline-flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
          {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </span>
        <span>{theme === "dark" ? "Dark mode" : "Light mode"}</span>
      </span>
      <span className="rounded-full border border-border bg-bg-elevated px-2 py-1 font-mono text-[10px] uppercase text-text-muted">
        Toggle
      </span>
    </button>
  );
}

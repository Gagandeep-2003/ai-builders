"use client";

import { motion } from "framer-motion";
import { cn, percent } from "@/lib/utils";

export function ProgressBar({
  value,
  max,
  label,
  color = "from-accent to-accent-warm",
  className,
}: {
  value: number;
  max: number;
  label?: string;
  color?: string;
  className?: string;
}) {
  const width = percent(value, max);

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-text-secondary">{label}</span>
          <span className="font-mono text-xs text-text-primary">
            {value}/{max}
          </span>
        </div>
      ) : null}
      <div className="h-2.5 overflow-hidden rounded-full border border-white/[0.04] bg-white/[0.05]">
        <motion.div
          className={cn("progress-shine h-full rounded-full bg-gradient-to-r", color)}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

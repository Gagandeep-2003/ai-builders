"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AnimatedPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.main
      className={cn("space-y-8", className)}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14, ease: "easeOut" }}
    >
      {children}
    </motion.main>
  );
}

export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.025,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 5 },
        show: { opacity: 1, y: 0 },
      }}
      initial="hidden"
      animate="show"
      transition={{ duration: 0.14, ease: "easeOut", delay: Math.min(delay, 0.04) }}
    >
      {children}
    </motion.div>
  );
}

export const MotionDiv = motion.div;
export const MotionButton = motion.button;

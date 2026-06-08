"use client";

import { motion } from "framer-motion";

export function ProgressRing({ value }: { value: number }) {
  return (
    <div className="relative grid h-44 w-44 place-items-center rounded-full">
      <motion.div
        className="absolute inset-0 rounded-full"
        initial={{ background: "conic-gradient(#6EE7B7 0deg, rgba(255,255,255,0.06) 0deg)" }}
        animate={{
          background: `conic-gradient(#6EE7B7 ${value * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <div className="absolute inset-4 rounded-full bg-bg-card" />
      <div className="relative text-center">
        <div className="font-heading text-4xl font-bold">{value}%</div>
        <div className="mt-1 font-mono text-xs uppercase text-text-muted">Complete</div>
      </div>
    </div>
  );
}

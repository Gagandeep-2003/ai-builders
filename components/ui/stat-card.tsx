"use client";

import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FolderOpen,
  Megaphone,
  UsersRound,
} from "lucide-react";
import { MotionDiv } from "@/components/ui/animated";
import { cn } from "@/lib/utils";

const icons = {
  book: BookOpenCheck,
  calendar: CalendarDays,
  clipboard: ClipboardList,
  review: ClipboardCheck,
  folder: FolderOpen,
  megaphone: Megaphone,
  users: UsersRound,
};

export type StatIconName = keyof typeof icons;

export function StatCard({
  icon,
  label,
  value,
  trend,
  className,
}: {
  icon: StatIconName;
  label: string;
  value: number;
  trend?: string;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const Icon = icons[icon];

  useEffect(() => {
    let frame = 0;
    const totalFrames = 28;
    const interval = window.setInterval(() => {
      frame += 1;
      setCount(Math.round((value * frame) / totalFrames));
      if (frame >= totalFrames) window.clearInterval(interval);
    }, 18);

    return () => window.clearInterval(interval);
  }, [value]);

  return (
    <MotionDiv
      whileHover={{ y: -3 }}
      className={cn("premium-card premium-card-hover rounded-xl p-5", className)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-xl border border-accent/20 bg-accent/10 p-3 text-accent">
          <Icon className="h-5 w-5" />
        </div>
        {trend ? <span className="font-mono text-xs text-accent">{trend}</span> : null}
      </div>
      <div className="mt-6">
        <div className="font-heading text-3xl font-bold">{count}</div>
        <div className="mt-1 text-sm text-text-secondary">{label}</div>
      </div>
    </MotionDiv>
  );
}

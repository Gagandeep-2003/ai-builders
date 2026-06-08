import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  pending: "border-accent-warm/35 bg-accent-warm/10 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.12)]",
  submitted: "border-info/35 bg-info/10 text-blue-200 shadow-[0_0_18px_rgba(96,165,250,0.12)]",
  reviewed: "border-success/35 bg-success/10 text-emerald-200 shadow-[0_0_18px_rgba(52,211,153,0.12)]",
  present: "border-success/35 bg-success/10 text-emerald-200 shadow-[0_0_18px_rgba(52,211,153,0.12)]",
  absent: "border-danger/35 bg-danger/10 text-rose-200 shadow-[0_0_18px_rgba(251,113,133,0.12)]",
  rescheduled: "border-info/35 bg-info/10 text-blue-200 shadow-[0_0_18px_rgba(96,165,250,0.12)]",
  completed: "border-success/35 bg-success/10 text-emerald-200",
  current: "border-accent/40 bg-accent/10 text-accent shadow-[0_0_18px_rgba(110,231,183,0.14)]",
  locked: "border-border bg-white/[0.03] text-text-muted",
  overdue: "border-danger/35 bg-danger/10 text-rose-200",
  soon: "border-accent-warm/35 bg-accent-warm/10 text-amber-200",
  approved: "border-success/35 bg-success/10 text-emerald-200",
  rejected: "border-danger/35 bg-danger/10 text-rose-200",
  used: "border-border bg-white/[0.03] text-text-muted",
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] font-bold uppercase",
        styles[status] ?? "border-border bg-white/[0.03] text-text-secondary",
        className,
      )}
    >
      {label ?? status}
    </span>
  );
}

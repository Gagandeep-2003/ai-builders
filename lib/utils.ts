import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions) {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: options?.year ?? "numeric",
    ...options,
  }).format(date);
}

export function daysUntil(value: string | Date) {
  const target = typeof value === "string" ? new Date(value) : value;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - start.getTime()) / 86_400_000);
}

export function getDueTone(dueDate: string, status?: string) {
  if (status === "submitted" || status === "reviewed") return "success";
  const days = daysUntil(dueDate);
  if (days < 0) return "danger";
  if (days <= 2) return "warning";
  return "success";
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function percent(value: number, max: number) {
  if (!max) return 0;
  return Math.round((value / max) * 100);
}

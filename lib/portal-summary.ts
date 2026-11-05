import type { StudentBadge } from "@/lib/course-data";

export type PortalBadge = {
  count: number;
  tone: "accent" | "info" | "warm" | "danger";
  label: string;
};

export type StudentPortalSummary = {
  role: "student";
  pendingHomeworkCount: number;
  unreadChatCount: number;
  classBadge?: PortalBadge;
  unseenBadge?: StudentBadge;
};

export type AdminPortalSummary = {
  role: "admin";
  todayClasses: number;
  pendingHomework: number;
  pendingReschedules: number;
  pendingPasswords: number;
  onlineStudents: number;
  unreadChatCount: number;
};

export type PortalSummary = StudentPortalSummary | AdminPortalSummary;

"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminCommandAction } from "@/components/admin/admin-command-center";
import { ChatNotificationPrompt } from "@/components/chat/chat-notification-prompt";
import { ChatUnreadPoller } from "@/components/chat/chat-unread-poller";
import { PortalAutoSync } from "@/components/portal/portal-auto-sync";
import { CardBorderGlow } from "@/components/ui/card-border-glow";
import { SidebarNav, type NavBadge, type NavLink } from "@/components/ui/sidebar-nav";
import { reportSignInToShell } from "@/lib/client-performance";
import type {
  AdminPortalSummary,
  PortalSummary,
  StudentPortalSummary,
} from "@/lib/portal-summary";

const StudentSplashCursor = dynamic(
  () => import("@/components/portal/student-splash-cursor").then((module) => module.StudentSplashCursor),
  { ssr: false },
);
const StudentStrandsSearch = dynamic(
  () => import("@/components/portal/student-strands-search").then((module) => module.StudentStrandsSearch),
  { ssr: false },
);
const ReferralCampaignLaunch = dynamic(
  () => import("@/components/portal/referral-campaign-launch").then((module) => module.ReferralCampaignLaunch),
  { ssr: false },
);
const BadgeCelebration = dynamic(
  () => import("@/components/portal/badge-celebration").then((module) => module.BadgeCelebration),
  { ssr: false },
);
const AdminCommandCenter = dynamic(
  () => import("@/components/admin/admin-command-center").then((module) => module.AdminCommandCenter),
  { ssr: false },
);

export const PORTAL_SUMMARY_REFRESH_EVENT = "portal:summary-refresh";

type PortalRole = "student" | "admin";

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function adminActions(summary: AdminPortalSummary): AdminCommandAction[] {
  return [
    {
      title: "Today's classes",
      description: "Open the dashboard section for live class timing, students, and Meet links.",
      href: "/admin",
      tone: "info",
      count: summary.todayClasses,
      keywords: ["today", "class", "meet", "schedule", "live"],
    },
    {
      title: "Review submitted homework",
      description: "Check student evidence, completion status, and feedback.",
      href: "/admin/homework",
      tone: "warm",
      count: summary.pendingHomework,
      keywords: ["homework", "proof", "submission", "review", "evidence"],
    },
    {
      title: "Approve make-up requests",
      description: "Approve or reject student reschedule requests and confirm their class link.",
      href: "/admin/attendance",
      tone: "accent",
      count: summary.pendingReschedules,
      keywords: ["reschedule", "makeup", "request", "attendance"],
    },
    {
      title: "Open student chat",
      description: "Message students privately with text or voice notes.",
      href: "/admin/chat",
      tone: "accent",
      count: summary.unreadChatCount,
      keywords: ["chat", "message", "student", "voice"],
    },
    {
      title: "Password requests",
      description: "Review student password change requests from the admin dashboard.",
      href: "/admin",
      tone: "danger",
      count: summary.pendingPasswords,
      keywords: ["password", "login", "security", "request"],
    },
    {
      title: "Manage student slots",
      description: "See which teaching slots are booked, available, or partially clashing.",
      href: "/admin/slots",
      tone: "info",
      keywords: ["slots", "availability", "booking", "calendar"],
    },
    {
      title: "Add resources",
      description: "Manage student resources, decks, embedded material, and module links.",
      href: "/admin/resources",
      tone: "accent",
      keywords: ["resources", "canva", "module", "deck"],
    },
    {
      title: "Review referrals",
      description: "Follow student introductions, enrolment progress, and rewards.",
      href: "/admin/referrals",
      tone: "warm",
      keywords: ["referral", "friend", "sibling", "reward"],
    },
  ];
}

function emptyAdminSummary(): AdminPortalSummary {
  return {
    role: "admin",
    todayClasses: 0,
    pendingHomework: 0,
    pendingReschedules: 0,
    pendingPasswords: 0,
    onlineStudents: 0,
    unreadChatCount: 0,
  };
}

export function refreshPortalSummary() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PORTAL_SUMMARY_REFRESH_EVENT));
  }
}

export function PortalShell({
  role,
  profileId,
  profileName,
  links,
  children,
}: {
  role: PortalRole;
  profileId: string;
  profileName: string;
  links: NavLink[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [summary, setSummary] = useState<PortalSummary | null>(null);
  const [enhancementsReady, setEnhancementsReady] = useState(false);
  const [richEffects, setRichEffects] = useState(false);
  const fetchedOnce = useRef(false);
  const refreshTimer = useRef<number | undefined>(undefined);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch("/api/portal-summary", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return;
      const payload = (await response.json()) as PortalSummary;
      if (payload.role !== role) return;
      setSummary(payload);
      fetchedOnce.current = true;
    } catch {
      // Counts are supplemental; route content remains fully usable.
    }
  }, [role]);

  useEffect(() => {
    reportSignInToShell(role);
  }, [role]);

  useEffect(() => {
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const lowerCapability =
      (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) ||
      connection?.saveData === true ||
      connection?.effectiveType === "2g" ||
      connection?.effectiveType === "slow-2g";
    const allowRichEffects = !reducedMotion && !coarsePointer && !lowerCapability;
    document.documentElement.dataset.portalEffects = allowRichEffects ? "full" : "reduced";

    const activate = () => {
      setRichEffects(allowRichEffects);
      setEnhancementsReady(true);
    };
    const idleWindow = window as IdleWindow;
    const idleHandle = idleWindow.requestIdleCallback?.(activate, { timeout: 1_500 });
    const timer = idleHandle == null ? window.setTimeout(activate, 900) : undefined;

    return () => {
      if (idleHandle != null) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timer != null) window.clearTimeout(timer);
      delete document.documentElement.dataset.portalEffects;
    };
  }, []);

  useEffect(() => {
    const idleWindow = window as IdleWindow;
    if (fetchedOnce.current) {
      const timer = window.setTimeout(() => void fetchSummary(), 250);
      return () => window.clearTimeout(timer);
    }

    const run = () => void fetchSummary();
    const idleHandle = idleWindow.requestIdleCallback?.(run, { timeout: 800 });
    const timer = idleHandle == null ? window.setTimeout(run, 180) : undefined;
    return () => {
      if (idleHandle != null) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timer != null) window.clearTimeout(timer);
    };
  }, [fetchSummary, pathname]);

  useEffect(() => {
    const scheduleRefresh = (delay = 700) => {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
      refreshTimer.current = window.setTimeout(() => void fetchSummary(), delay);
    };
    const onSummaryRefresh = () => scheduleRefresh(0);
    const onSubmit = () => scheduleRefresh(1_100);
    const onVisibility = () => {
      if (document.visibilityState === "visible") scheduleRefresh(150);
    };

    window.addEventListener(PORTAL_SUMMARY_REFRESH_EVENT, onSummaryRefresh);
    window.addEventListener("chat:unread-refresh", onSummaryRefresh);
    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
      window.removeEventListener(PORTAL_SUMMARY_REFRESH_EVENT, onSummaryRefresh);
      window.removeEventListener("chat:unread-refresh", onSummaryRefresh);
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchSummary]);

  const studentSummary = summary?.role === "student" ? summary as StudentPortalSummary : null;
  const adminSummary = summary?.role === "admin" ? summary as AdminPortalSummary : null;
  const unreadChatCount = summary?.unreadChatCount ?? 0;
  const badges: Partial<Record<string, NavBadge>> = role === "student"
    ? {
        "/homework": studentSummary?.pendingHomeworkCount
          ? { count: studentSummary.pendingHomeworkCount, tone: "warm", label: "Homework pending" }
          : undefined,
        "/class": studentSummary?.classBadge,
        "/chat": unreadChatCount
          ? { count: unreadChatCount, tone: "accent", label: "Unread mentor messages" }
          : undefined,
      }
    : {
        "/admin": adminSummary?.todayClasses
          ? { count: adminSummary.todayClasses, tone: "info", label: "Classes today" }
          : undefined,
        "/admin/homework": adminSummary?.pendingHomework
          ? { count: adminSummary.pendingHomework, tone: "warm", label: "Homework reviews pending" }
          : undefined,
        "/admin/attendance": adminSummary?.pendingReschedules
          ? { count: adminSummary.pendingReschedules, tone: "accent", label: "Make-up requests pending" }
          : undefined,
        "/admin/students": adminSummary?.onlineStudents
          ? { count: adminSummary.onlineStudents, tone: "accent", label: "Students online now" }
          : undefined,
        "/admin/chat": unreadChatCount
          ? { count: unreadChatCount, tone: "accent", label: "Unread student messages" }
          : undefined,
      };

  const effectiveAdminSummary = adminSummary ?? emptyAdminSummary();

  return (
    <div className="min-h-screen">
      {enhancementsReady && richEffects ? <CardBorderGlow /> : null}
      {role === "student" && enhancementsReady ? (
        <>
          {richEffects ? <StudentSplashCursor studentId={profileId} /> : null}
          <StudentStrandsSearch studentId={profileId} studentName={profileName} />
          <ReferralCampaignLaunch studentId={profileId} studentName={profileName} />
          <BadgeCelebration
            key={studentSummary?.unseenBadge?.id ?? "no-unseen-badge"}
            award={studentSummary?.unseenBadge}
          />
        </>
      ) : null}
      {enhancementsReady ? (
        <>
          <ChatNotificationPrompt />
          <ChatUnreadPoller
            initialUnreadCount={unreadChatCount}
            defaultHref={role === "admin" ? "/admin/chat" : "/chat"}
            defaultTitle={role === "admin" ? "New student message" : "New message from your mentor"}
          />
          <PortalAutoSync />
        </>
      ) : null}
      {role === "admin" && enhancementsReady ? (
        <AdminCommandCenter
          data={{
            ...effectiveAdminSummary,
            actions: adminActions(effectiveAdminSummary),
          }}
        />
      ) : null}
      <SidebarNav
        links={links}
        badges={badges}
        footer={role === "admin" ? (
          <Link
            href="/dashboard"
            prefetch={false}
            className="button-motion flex w-full items-center rounded-xl border border-accent/25 bg-accent/10 px-3 py-2.5 text-sm text-accent"
          >
            View as Student
          </Link>
        ) : undefined}
      />
      <div className="px-4 py-20 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </div>
    </div>
  );
}

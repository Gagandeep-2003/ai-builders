import { requireStudentAccess } from "@/lib/auth";
import { PortalAutoSync } from "@/components/portal/portal-auto-sync";
import { StudentStrandsSearch } from "@/components/portal/student-strands-search";
import { StudentSplashCursor } from "@/components/portal/student-splash-cursor";
import { ChatNotificationPrompt } from "@/components/chat/chat-notification-prompt";
import { ChatUnreadPoller } from "@/components/chat/chat-unread-poller";
import { CardBorderGlow } from "@/components/ui/card-border-glow";
import { SidebarNav, type NavBadge, type NavLink } from "@/components/ui/sidebar-nav";
import { getNextClassEvent, getStudentClassEvents } from "@/lib/class-events";
import { getStudentShellData } from "@/lib/data";
import { BadgeCelebration } from "@/components/portal/badge-celebration";

const links: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard", priority: true },
  { href: "/journey", label: "Journey", icon: "journey" },
  { href: "/curriculum", label: "Curriculum", icon: "book" },
  { href: "/homework", label: "Homework", icon: "check", priority: true },
  { href: "/resources", label: "Resources", icon: "folder", priority: true },
  { href: "/class", label: "My Class", icon: "calendar", priority: true },
  { href: "/chat", label: "Mentor Chat", icon: "message", priority: true },
  { href: "/progress", label: "Progress", icon: "chart" },
  { href: "/league", label: "AI Builders League", icon: "league" },
  { href: "/referrals", label: "Refer & Earn", icon: "referrals" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireStudentAccess();
  const data = await getStudentShellData();
  const nextClassEvent = getNextClassEvent(
    getStudentClassEvents({
      student: data.student,
      batch: data.batch,
      sessions: data.sessions,
      requests: data.rescheduleRequests,
    }),
  );
  const badges: Partial<Record<string, NavBadge>> = {
    "/homework": data.pendingHomeworkCount
      ? { count: data.pendingHomeworkCount, tone: "warm", label: "Homework pending" }
      : undefined,
    "/class": nextClassEvent ? {
      count: 1,
      tone: nextClassEvent.kind !== "regular" ? "accent" : "info",
      label: nextClassEvent.kind === "makeup"
        ? "Make-up class scheduled"
        : nextClassEvent.kind === "rescheduled"
          ? "Class rescheduled"
          : "Class link status available",
    } : undefined,
    "/chat": data.unreadChatCount
      ? { count: data.unreadChatCount, tone: "accent", label: "Unread mentor messages" }
      : undefined,
  };
  return (
    <div className="min-h-screen">
      <CardBorderGlow />
      <StudentSplashCursor studentId={data.student.id} />
      <StudentStrandsSearch studentId={data.student.id} studentName={data.student.fullName} />
      <BadgeCelebration key={data.unseenBadge?.id ?? "no-unseen-badge"} award={data.unseenBadge} />
      <ChatNotificationPrompt />
      <ChatUnreadPoller
        initialUnreadCount={data.unreadChatCount}
        defaultHref="/chat"
        defaultTitle="New message from your mentor"
      />
      <PortalAutoSync />
      <SidebarNav links={links} badges={badges} />
      <div className="px-4 py-20 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </div>
    </div>
  );
}

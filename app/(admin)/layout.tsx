import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AdminCommandCenter, type AdminCommandAction } from "@/components/admin/admin-command-center";
import { PortalAutoSync } from "@/components/portal/portal-auto-sync";
import { CardBorderGlow } from "@/components/ui/card-border-glow";
import { SidebarNav, type NavBadge, type NavLink } from "@/components/ui/sidebar-nav";
import { getAdminClassEvents } from "@/lib/class-events";
import { getAdminShellData } from "@/lib/data";
import { ADMIN_TIME_ZONE, formatInTimeZone } from "@/lib/time";

const links: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", priority: true },
  { href: "/admin/students", label: "Students", icon: "students", priority: true },
  { href: "/admin/slots", label: "Slots", icon: "slots" },
  { href: "/admin/progress", label: "Progress", icon: "chart" },
  { href: "/admin/homework", label: "Homework", icon: "homework", priority: true },
  { href: "/admin/resources", label: "Resources", icon: "files" },
  { href: "/admin/attendance", label: "Attendance", icon: "attendance", priority: true },
  { href: "/admin/feedback", label: "Feedback", icon: "message" },
  { href: "/admin/referrals", label: "Referrals", icon: "referrals" },
  { href: "/admin/announcements", label: "Announcements", icon: "megaphone" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const data = await getAdminShellData();
  const now = new Date();
  const todayKey = formatInTimeZone(now, ADMIN_TIME_ZONE, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayClasses = getAdminClassEvents({
    students: data.students,
    batches: data.batches,
    sessions: data.sessions,
    requests: data.rescheduleRequests,
    attendance: data.attendance,
    now,
  }).filter((event) => {
      return formatInTimeZone(event.startsAt, ADMIN_TIME_ZONE, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }) === todayKey;
  }).length;
  const pendingHomework = data.homework.reduce(
    (count, item) => count + (item.submissions?.filter((submission) => submission.status === "submitted").length ?? 0),
    0,
  );
  const pendingReschedules = data.rescheduleRequests.filter((request) => request.status === "pending").length;
  const pendingPasswords = data.passwordRequests.filter((request) => request.status === "pending").length;
  const onlineStudents = data.students.filter((student) => {
    if (!student.lastSeenAt) return false;
    const seenAt = new Date(student.lastSeenAt);
    return Number.isFinite(seenAt.getTime()) && now.getTime() - seenAt.getTime() <= 2 * 60_000;
  }).length;
  const badges: Partial<Record<string, NavBadge>> = {
    "/admin": todayClasses ? { count: todayClasses, tone: "info", label: "Classes today" } : undefined,
    "/admin/homework": pendingHomework ? { count: pendingHomework, tone: "warm", label: "Homework reviews pending" } : undefined,
    "/admin/attendance": pendingReschedules ? { count: pendingReschedules, tone: "accent", label: "Make-up requests pending" } : undefined,
    "/admin/students": onlineStudents ? { count: onlineStudents, tone: "accent", label: "Students online now" } : undefined,
  };
  const actions: AdminCommandAction[] = [
    {
      title: "Today's classes",
      description: "Open the dashboard section for live class timing, students, and Meet links.",
      href: "/admin",
      tone: "info",
      count: todayClasses,
      keywords: ["today", "class", "meet", "schedule", "live"],
    },
    {
      title: "Review submitted homework",
      description: "Check screen/camera proof, text evidence, files, browser details, and completion status.",
      href: "/admin/homework",
      tone: "warm",
      count: pendingHomework,
      keywords: ["homework", "proof", "submission", "review", "evidence"],
    },
    {
      title: "Approve make-up requests",
      description: "Approve or reject student reschedule requests and confirm their class link.",
      href: "/admin/attendance",
      tone: "accent",
      count: pendingReschedules,
      keywords: ["reschedule", "makeup", "make-up", "request", "attendance"],
    },
    {
      title: "Password requests",
      description: "Review student password change requests from the admin dashboard.",
      href: "/admin",
      tone: "danger",
      count: pendingPasswords,
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
      description: "Manage student resources, Canva decks, embedded material, and module links.",
      href: "/admin/resources",
      tone: "accent",
      keywords: ["resources", "canva", "module", "deck"],
    },
    {
      title: "Review referrals",
      description: "Follow student introductions, enrolment progress, and bonus skill-lab rewards.",
      href: "/admin/referrals",
      tone: "warm",
      keywords: ["referral", "friend", "sibling", "reward", "bonus class"],
    },
  ];

  return (
    <div className="min-h-screen">
      <CardBorderGlow />
      <AdminCommandCenter
        data={{
          todayClasses,
          pendingHomework,
          pendingReschedules,
          pendingPasswords,
          onlineStudents,
          actions,
        }}
      />
      <PortalAutoSync />
      <SidebarNav
        links={links}
        badges={badges}
        footer={
          <Link
            href="/dashboard"
            className="button-motion flex w-full items-center rounded-xl border border-accent/25 bg-accent/10 px-3 py-2.5 text-sm text-accent"
          >
            View as Student
          </Link>
        }
      />
      <div className="px-4 py-20 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </div>
    </div>
  );
}

import { requireStudentAccess } from "@/lib/auth";
import { PortalAutoSync } from "@/components/portal/portal-auto-sync";
import { StudentStrandsSearch } from "@/components/portal/student-strands-search";
import { CardBorderGlow } from "@/components/ui/card-border-glow";
import { SidebarNav, type NavBadge, type NavLink } from "@/components/ui/sidebar-nav";
import { getNextClassEvent, getStudentClassEvents } from "@/lib/class-events";
import { getStudentShellData } from "@/lib/data";

const links: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard", priority: true },
  { href: "/journey", label: "Journey", icon: "journey" },
  { href: "/curriculum", label: "Curriculum", icon: "book" },
  { href: "/homework", label: "Homework", icon: "check", priority: true },
  { href: "/resources", label: "Resources", icon: "folder", priority: true },
  { href: "/class", label: "My Class", icon: "calendar", priority: true },
  { href: "/progress", label: "Progress", icon: "chart" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireStudentAccess();
  const data = await getStudentShellData();
  const pendingHomework = data.homework.filter((item) => item.status === "pending").length;
  const nextClassEvent = getNextClassEvent(
    getStudentClassEvents({
      student: data.student,
      batch: data.batch,
      sessions: data.sessions,
      requests: data.rescheduleRequests,
    }),
  );
  const badges: Partial<Record<string, NavBadge>> = {
    "/homework": pendingHomework ? { count: pendingHomework, tone: "warm", label: "Homework pending" } : undefined,
    "/class": nextClassEvent ? {
      count: 1,
      tone: nextClassEvent.kind !== "regular" ? "accent" : "info",
      label: nextClassEvent.kind === "makeup"
        ? "Make-up class scheduled"
        : nextClassEvent.kind === "rescheduled"
          ? "Class rescheduled"
          : "Class link status available",
    } : undefined,
  };
  return (
    <div className="min-h-screen">
      <CardBorderGlow />
      <StudentStrandsSearch studentName={data.student.fullName} />
      <PortalAutoSync />
      <SidebarNav links={links} badges={badges} />
      <div className="px-4 py-20 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </div>
    </div>
  );
}

import { requireStudentAccess } from "@/lib/auth";
import { getStudentDashboardData } from "@/lib/data";
import { formatSessionTime, getNextSession, getSessionDateTimes } from "@/lib/time";
import { PortalAutoSync, type ClassAlert } from "@/components/portal/portal-auto-sync";
import { SidebarNav, type NavLink } from "@/components/ui/sidebar-nav";

const links: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/journey", label: "Journey", icon: "journey" },
  { href: "/curriculum", label: "Curriculum", icon: "book" },
  { href: "/homework", label: "Homework", icon: "check" },
  { href: "/resources", label: "Resources", icon: "folder" },
  { href: "/class", label: "My Class", icon: "calendar" },
  { href: "/progress", label: "Progress", icon: "chart" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireStudentAccess();
  const data = await getStudentDashboardData();
  const nextSession = getNextSession(data.sessions);
  const alerts: ClassAlert[] = nextSession
    ? [
        {
          id: `${data.batch.id}-${nextSession.id}`,
          title: "Your bootcamp class starts soon",
          body: `${nextSession.title} at ${formatSessionTime(nextSession, data.batch, data.student.timeZone)}`,
          startsAt: getSessionDateTimes(nextSession, data.batch).startsAt.toISOString(),
        },
      ]
    : [];

  return (
    <div className="min-h-screen">
      <PortalAutoSync alerts={alerts} />
      <SidebarNav links={links} />
      <div className="px-4 py-20 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </div>
    </div>
  );
}

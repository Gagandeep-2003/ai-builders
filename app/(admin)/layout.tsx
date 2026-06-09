import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAdminData } from "@/lib/data";
import { ADMIN_TIME_ZONE, formatSessionTime, getSessionDateTimes } from "@/lib/time";
import { PortalAutoSync, type ClassAlert } from "@/components/portal/portal-auto-sync";
import { SidebarNav, type NavLink } from "@/components/ui/sidebar-nav";

const links: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/students", label: "Students", icon: "students" },
  { href: "/admin/batches", label: "Batches", icon: "home" },
  { href: "/admin/slots", label: "Slots", icon: "slots" },
  { href: "/admin/homework", label: "Homework", icon: "homework" },
  { href: "/admin/resources", label: "Resources", icon: "files" },
  { href: "/admin/attendance", label: "Attendance", icon: "attendance" },
  { href: "/admin/feedback", label: "Feedback", icon: "message" },
  { href: "/admin/announcements", label: "Announcements", icon: "megaphone" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const data = await getAdminData();
  const now = new Date();
  const alerts: ClassAlert[] = data.batches
    .flatMap((batch) =>
      data.sessions.map((session) => {
        const { startsAt } = getSessionDateTimes(session, batch);
        return {
          id: `${batch.id}-${session.id}`,
          title: "Bootcamp class starting soon",
          body: `${batch.name}: ${session.title} at ${formatSessionTime(session, batch, ADMIN_TIME_ZONE)}`,
          startsAt: startsAt.toISOString(),
        };
      }),
    )
    .filter((alert) => new Date(alert.startsAt).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 12);

  return (
    <div className="min-h-screen">
      <PortalAutoSync alerts={alerts} />
      <SidebarNav
        links={links}
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

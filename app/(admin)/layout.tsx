import { requireAdmin } from "@/lib/auth";
import { PortalShell } from "@/components/portal/portal-shell";
import type { NavLink } from "@/components/ui/sidebar-nav";

const links: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", priority: true },
  { href: "/admin/students", label: "Students", icon: "students", priority: true },
  { href: "/admin/chat", label: "Student Chat", icon: "message", priority: true },
  { href: "/admin/slots", label: "Slots", icon: "slots" },
  { href: "/admin/progress", label: "Progress", icon: "chart" },
  { href: "/admin/homework", label: "Homework", icon: "homework", priority: true },
  { href: "/admin/resources", label: "Resources", icon: "files" },
  { href: "/admin/attendance", label: "Attendance", icon: "attendance", priority: true },
  { href: "/admin/feedback", label: "Feedback", icon: "message" },
  { href: "/admin/demo-requests", label: "Demo Requests", icon: "calendar" },
  { href: "/admin/referrals", label: "Referrals", icon: "referrals" },
  { href: "/admin/announcements", label: "Announcements", icon: "megaphone" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();
  return (
    <PortalShell
      role="admin"
      profileId={profile.id}
      profileName={profile.fullName}
      links={links}
    >
      {children}
    </PortalShell>
  );
}

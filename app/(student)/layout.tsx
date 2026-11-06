import { requireStudentAccess } from "@/lib/auth";
import { PortalShell } from "@/components/portal/portal-shell";
import type { NavLink } from "@/components/ui/sidebar-nav";

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
  { href: "/referrals", label: "$100 Refer & Earn", icon: "referrals" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireStudentAccess();
  return (
    <PortalShell
      role="student"
      profileId={profile.id}
      profileName={profile.fullName}
      links={links}
    >
      {children}
    </PortalShell>
  );
}

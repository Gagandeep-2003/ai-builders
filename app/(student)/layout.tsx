import { requireStudentAccess } from "@/lib/auth";
import { PortalAutoSync } from "@/components/portal/portal-auto-sync";
import { CardBorderGlow } from "@/components/ui/card-border-glow";
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

  return (
    <div className="min-h-screen">
      <CardBorderGlow />
      <PortalAutoSync />
      <SidebarNav links={links} />
      <div className="px-4 py-20 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </div>
    </div>
  );
}

import { requireStudentAccess } from "@/lib/auth";
import { PortalAutoSync } from "@/components/portal/portal-auto-sync";
import { StudentStrandsSearch, type StudentSearchItem } from "@/components/portal/student-strands-search";
import { CardBorderGlow } from "@/components/ui/card-border-glow";
import { SidebarNav, type NavBadge, type NavLink } from "@/components/ui/sidebar-nav";
import { getStudentDashboardData } from "@/lib/data";
import { getActiveOrNextJoinSession } from "@/lib/time";

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
  const pendingHomework = data.homework.filter((item) => item.status === "pending").length;
  const nextJoinSession = getActiveOrNextJoinSession(data.sessions, data.batch);
  const badges: Partial<Record<string, NavBadge>> = {
    "/homework": pendingHomework ? { count: pendingHomework, tone: "warm", label: "Homework pending" } : undefined,
    "/class": nextJoinSession ? { count: 1, tone: "info", label: "Class link status available" } : undefined,
  };
  const searchItems: StudentSearchItem[] = [
    ...data.modules.map((module) => ({
      title: module.title,
      eyebrow: `Module ${module.orderIndex}`,
      description: module.description,
      href: "/curriculum",
      keywords: ["module", "curriculum", module.title],
      priority: 2,
    })),
    ...data.sessions.map((session) => ({
      title: session.title,
      eyebrow: `Session ${session.globalNumber}`,
      description: session.focus,
      href: "/curriculum",
      keywords: [
        "session",
        session.status,
        session.studentOutput,
        session.toolsCovered.join(" "),
        `module ${Math.ceil(session.globalNumber / 8)}`,
      ],
      priority: session.status === "current" ? 8 : session.status === "completed" ? 4 : 1,
    })),
    ...data.homework.map((homework) => ({
      title: homework.title,
      eyebrow: homework.kind === "class_challenge" ? "Class Challenge" : "Home Task",
      description: homework.description,
      href: `/homework/${homework.id}`,
      keywords: [
        "homework",
        homework.status,
        homework.sessionName,
        homework.details?.tools.join(" ") ?? "",
        homework.details?.aiType ?? "",
        homework.details?.moduleTitle ?? "",
      ],
      priority: homework.status === "pending" ? 10 : 3,
    })),
    ...data.resources.map((resource) => ({
      title: resource.title,
      eyebrow: resource.type,
      description: `${resource.sessionName} resource`,
      href: "/resources",
      keywords: ["resource", resource.type, resource.moduleId, resource.title],
      priority: 2,
    })),
    {
      title: "My Class",
      eyebrow: "Live class",
      description: "Join class, see your batch schedule, and request make-up classes.",
      href: "/class",
      keywords: ["class", "join", "meet", "reschedule", "makeup", "schedule"],
      priority: nextJoinSession ? 12 : 4,
    },
    {
      title: "Progress",
      eyebrow: "Course report",
      description: "Review completed sessions, attendance, feedback, and progress.",
      href: "/progress",
      keywords: ["progress", "report", "attendance", "feedback", "completed"],
      priority: 3,
    },
    {
      title: "Profile",
      eyebrow: "Account",
      description: "Edit parent contact, country, avatar, and password request options.",
      href: "/profile",
      keywords: ["profile", "parent", "country", "password", "avatar"],
      priority: 1,
    },
  ];

  return (
    <div className="min-h-screen">
      <CardBorderGlow />
      <StudentStrandsSearch studentName={data.student.fullName} items={searchItems} />
      <PortalAutoSync />
      <SidebarNav links={links} badges={badges} />
      <div className="px-4 py-20 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </div>
    </div>
  );
}

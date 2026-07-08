import { getCurrentProfile } from "@/lib/auth";
import { getNextClassEvent, getStudentClassEvents } from "@/lib/class-events";
import { getStudentDashboardData } from "@/lib/data";

export const runtime = "nodejs";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "student" && profile.role !== "admin")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getStudentDashboardData();
  const nextClassEvent = getNextClassEvent(
    getStudentClassEvents({
      student: data.student,
      batch: data.batch,
      sessions: data.sessions,
      requests: data.rescheduleRequests,
    }),
  );
  const items = [
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
      priority: nextClassEvent ? 12 : 4,
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
    {
      title: "AI Builders League",
      eyebrow: "Momentum",
      description: "See your points, class streak, homework momentum, and current AI Builders League position.",
      href: "/league",
      keywords: ["leaderboard", "league", "rank", "points", "streak", "competition"],
      priority: 4,
    },
    {
      title: "Refer & Earn",
      eyebrow: "Family and friends bonus",
      description: "Refer a friend, sibling, cousin, or classmate and track eligibility for extra mastery sessions.",
      href: "/referrals",
      keywords: ["referral", "refer", "friend", "sibling", "cousin", "family", "reward", "bonus classes"],
      priority: 3,
    },
  ];

  return Response.json({ items });
}

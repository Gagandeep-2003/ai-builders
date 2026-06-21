import type {
  AttendanceItem,
  BadgeDefinition,
  BadgeProgress,
  CourseSession,
  HomeworkItem,
  StudentBadge,
} from "@/lib/course-data";

type CatalogRow = [
  string,
  string,
  string,
  string,
  string,
  BadgeDefinition["category"],
  BadgeDefinition["rarity"],
  number,
  boolean,
];

const rows: CatalogRow[] = [
  ["first-session", "First Launch", "Attend your first live AI Builders session.", "rocket", "#6ee7b7", "attendance", "common", 1, false],
  ["first-reviewed", "Proof of Progress", "Complete your first mentor-reviewed activity.", "check-circle", "#75a7ff", "homework", "common", 1, false],
  ["streak-3", "Momentum Three", "Attend three classes in a row.", "flame", "#fb923c", "streak", "rare", 3, false],
  ["streak-5", "Unbroken Five", "Attend five classes in a row.", "zap", "#facc15", "streak", "epic", 5, false],
  ["reviewed-5", "Builder Five", "Earn mentor approval on five activities.", "hammer", "#2dd4bf", "homework", "rare", 5, false],
  ["reviewed-10", "Tenfold Builder", "Earn mentor approval on ten activities.", "layers", "#a78bfa", "homework", "epic", 10, false],
  ["perfect-session", "Session Sweep", "Complete all four activities from one session.", "sparkles", "#f472b6", "homework", "epic", 4, false],
  ["module-1", "Agentic Explorer", "Complete all eight sessions in Module 1.", "brain", "#6ee7b7", "curriculum", "epic", 8, false],
  ["module-2", "App Alchemist", "Complete all eight sessions in Module 2.", "code", "#38bdf8", "curriculum", "epic", 8, false],
  ["module-3", "Automation Architect", "Complete all eight sessions in Module 3.", "workflow", "#c084fc", "curriculum", "epic", 8, false],
  ["showcase-ready", "Showcase Ready", "Complete a mentor-reviewed showcase activity.", "presentation", "#fb7185", "curriculum", "rare", 1, false],
  ["course-finisher", "AI Builders Graduate", "Complete every module in the course.", "trophy", "#facc15", "curriculum", "legendary", 24, false],
  ["creative-spark", "Creative Spark", "Awarded by your mentor for imaginative work.", "lightbulb", "#f472b6", "mentor", "rare", 1, true],
  ["problem-solver", "Problem Solver", "Awarded by your mentor for thoughtful problem solving.", "puzzle", "#38bdf8", "mentor", "rare", 1, true],
  ["most-improved", "Most Improved", "Awarded by your mentor for meaningful growth.", "trending-up", "#6ee7b7", "mentor", "epic", 1, true],
  ["helpful-collaborator", "Helpful Collaborator", "Awarded by your mentor for supporting others.", "users", "#a78bfa", "mentor", "rare", 1, true],
  ["outstanding-project", "Outstanding Project", "Awarded by your mentor for exceptional project work.", "star", "#facc15", "mentor", "legendary", 1, true],
];

export const badgeCatalog: BadgeDefinition[] = rows.map((row, index) => ({
  id: row[0],
  slug: row[0],
  name: row[1],
  description: row[2],
  iconKey: row[3],
  color: row[4],
  category: row[5],
  rarity: row[6],
  target: row[7],
  mentorAwarded: row[8],
  sortOrder: (index + 1) * 10,
}));

export function currentAttendanceStreak(attendance: AttendanceItem[]) {
  let streak = 0;
  for (const item of [...attendance].sort((a, b) => b.date.localeCompare(a.date))) {
    if (item.status === "rescheduled") continue;
    if (item.status !== "present") break;
    streak += 1;
  }
  return streak;
}

export function calculateBadgeProgress({
  definitions = badgeCatalog,
  awards,
  homework,
  attendance,
  sessions,
}: {
  definitions?: BadgeDefinition[];
  awards: StudentBadge[];
  homework: HomeworkItem[];
  attendance: AttendanceItem[];
  sessions: Array<CourseSession & { status?: string }>;
}): BadgeProgress[] {
  const earnedSlugs = new Set(awards.map((award) => award.definition.slug));
  const reviewed = homework.filter((item) => item.status === "reviewed");
  const reviewedBySession = new Map<string, number>();
  reviewed.forEach((item) => reviewedBySession.set(item.sessionId, (reviewedBySession.get(item.sessionId) ?? 0) + 1));
  const moduleCompleted = (moduleNumber: number) =>
    sessions.filter((item) => Math.ceil(item.globalNumber / 8) === moduleNumber && item.status === "completed").length;
  const streak = currentAttendanceStreak(attendance);
  const values: Record<string, number> = {
    "first-session": attendance.filter((item) => item.status === "present").length,
    "first-reviewed": reviewed.length,
    "streak-3": streak,
    "streak-5": streak,
    "reviewed-5": reviewed.length,
    "reviewed-10": reviewed.length,
    "perfect-session": Math.max(0, ...reviewedBySession.values()),
    "module-1": moduleCompleted(1),
    "module-2": moduleCompleted(2),
    "module-3": moduleCompleted(3),
    "showcase-ready": reviewed.some((item) => sessions.find((session) => session.id === item.sessionId)?.sessionNumber === 8) ? 1 : 0,
    "course-finisher": sessions.filter((item) => item.status === "completed").length,
  };

  return definitions.map((definition) => {
    const current = definition.mentorAwarded
      ? (earnedSlugs.has(definition.slug) ? 1 : 0)
      : (values[definition.slug] ?? 0);
    return {
      definition,
      current: Math.min(current, definition.target),
      target: definition.target,
      earned: earnedSlugs.has(definition.slug),
      percent: Math.min(100, Math.round((current / definition.target) * 100)),
    };
  });
}

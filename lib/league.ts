import type {
  AttendanceItem,
  CourseSession,
  HomeworkItem,
  StudentProfile,
} from "@/lib/course-data";

export type LeagueScore = {
  points: number;
  submittedTasks: number;
  reviewedTasks: number;
  presentClasses: number;
  attendanceRate: number;
  currentStreak: number;
  completedSessions: number;
};

export type LeagueEntry = LeagueScore & {
  id: string;
  name: string;
  country: string;
  stage: number;
  isStudent: boolean;
  avatarTone: string;
};

const PRACTICE_PROFILES = [
  ["Aarav S.", "United States"], ["Anaya P.", "United States"],
  ["Vihaan R.", "Canada"], ["Isha K.", "United States"],
  ["Arjun M.", "United Kingdom"], ["Meera N.", "United States"],
  ["Kabir D.", "Canada"], ["Riya J.", "United States"],
  ["Advait B.", "UAE"], ["Diya C.", "United States"],
  ["Reyansh G.", "Canada"], ["Saanvi T.", "United States"],
  ["Ishaan A.", "United Kingdom"], ["Myra V.", "United States"],
  ["Dev H.", "Canada"], ["Tara L.", "United States"],
  ["Ayaan Q.", "UAE"], ["Naina S.", "United States"],
  ["Rohan P.", "Canada"], ["Kiara M.", "United States"],
  ["Dhruv N.", "United Kingdom"], ["Avni R.", "United States"],
  ["Neil K.", "Canada"], ["Siya D.", "United States"],
  ["Viraj J.", "UAE"], ["Aadhya B.", "United States"],
  ["Kiaan C.", "Canada"], ["Mira G.", "United States"],
  ["Arnav T.", "United Kingdom"], ["Navya A.", "United States"],
  ["Ved V.", "Canada"], ["Prisha H.", "United Kingdom"],
] as const;

const AVATAR_TONES = [
  "from-cyan-400 to-blue-600",
  "from-emerald-300 to-teal-600",
  "from-fuchsia-400 to-violet-700",
  "from-amber-300 to-orange-600",
  "from-rose-400 to-pink-700",
];

function calculateCurrentStreak(attendance: AttendanceItem[]) {
  const ordered = [...attendance].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (const item of ordered) {
    if (item.status === "rescheduled") continue;
    if (item.status !== "present") break;
    streak += 1;
  }
  return streak;
}

export function calculateLeagueScore({
  homework,
  attendance,
  sessions,
}: {
  homework: HomeworkItem[];
  attendance: AttendanceItem[];
  sessions: Array<CourseSession & { status?: "completed" | "current" | "locked" }>;
}): LeagueScore {
  const submittedTasks = homework.filter((item) => item.status === "submitted" || item.status === "reviewed").length;
  const reviewedTasks = homework.filter((item) => item.status === "reviewed").length;
  const presentClasses = attendance.filter((item) => item.status === "present").length;
  const countedAttendance = attendance.filter((item) => item.status !== "rescheduled");
  const attendanceRate = countedAttendance.length
    ? Math.round((presentClasses / countedAttendance.length) * 100)
    : 0;
  const currentStreak = calculateCurrentStreak(attendance);
  const completedSessions = sessions.filter((session) => session.status === "completed").length;
  const points =
    submittedTasks * 60 +
    reviewedTasks * 20 +
    presentClasses * 40 +
    completedSessions * 25 +
    Math.min(currentStreak, 10) * 15;

  return {
    points,
    submittedTasks,
    reviewedTasks,
    presentClasses,
    attendanceRate,
    currentStreak,
    completedSessions,
  };
}

function seededRatio(index: number, salt: number) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export function buildPracticeLeague({
  student,
  score,
  unlockedSessions,
  unlockedTasks,
}: {
  student: StudentProfile;
  score: LeagueScore;
  unlockedSessions: number;
  unlockedTasks: number;
}): LeagueEntry[] {
  const stage = Math.max(1, unlockedSessions);
  const rivals = PRACTICE_PROFILES.map(([name, country], index) => {
    const diligence = 0.28 + seededRatio(index, 2) * 0.7;
    const submittedTasks = Math.min(
      unlockedTasks,
      Math.max(0, Math.round(unlockedTasks * diligence)),
    );
    const reviewedTasks = Math.round(submittedTasks * (0.18 + seededRatio(index, 3) * 0.52));
    const presentClasses = Math.min(
      stage,
      Math.max(0, Math.round(stage * (0.42 + seededRatio(index, 4) * 0.58))),
    );
    const currentStreak = Math.min(presentClasses, Math.round(seededRatio(index, 5) * 7));
    const completedSessions = Math.min(stage, Math.max(0, presentClasses - (index % 3 === 0 ? 1 : 0)));
    const attendanceRate = stage ? Math.round((presentClasses / stage) * 100) : 0;
    const points =
      submittedTasks * 60 +
      reviewedTasks * 20 +
      presentClasses * 40 +
      completedSessions * 25 +
      Math.min(currentStreak, 10) * 15;

    return {
      id: `practice-${index + 1}`,
      name,
      country,
      stage,
      points,
      submittedTasks,
      reviewedTasks,
      presentClasses,
      attendanceRate,
      currentStreak,
      completedSessions,
      isStudent: false,
      avatarTone: AVATAR_TONES[index % AVATAR_TONES.length],
    };
  });

  return [
    ...rivals,
    {
      id: student.id,
      name: student.fullName,
      country: student.country,
      stage,
      ...score,
      isStudent: true,
      avatarTone: "from-accent to-cyan-500",
    },
  ];
}

import type { CourseSession, HomeworkItem, ResourceItem } from "@/lib/course-data";

export type SessionAccessBoundary = {
  maxUnlockedGlobalNumber: number;
  currentSession?: CourseSession;
  unlockedSessionIds: string[];
};

type StatusSession = CourseSession & {
  status?: "completed" | "current" | "locked";
};

export function getSessionAccessBoundary(sessions: StatusSession[]): SessionAccessBoundary {
  const orderedSessions = [...sessions].sort((a, b) => a.globalNumber - b.globalNumber);
  const currentSession = orderedSessions.find((session) => session.status === "current");
  const completedSessions = orderedSessions.filter((session) => session.status === "completed");
  const lastCompleted = completedSessions.at(-1);
  const fallbackSession = orderedSessions[0];
  const maxUnlockedGlobalNumber =
    currentSession?.globalNumber ?? lastCompleted?.globalNumber ?? fallbackSession?.globalNumber ?? 0;

  return {
    maxUnlockedGlobalNumber,
    currentSession: currentSession ?? lastCompleted ?? fallbackSession,
    unlockedSessionIds: orderedSessions
      .filter((session) => session.globalNumber <= maxUnlockedGlobalNumber)
      .map((session) => session.id),
  };
}

export function isSessionUnlocked(
  session: Pick<CourseSession, "globalNumber"> | undefined,
  boundary: Pick<SessionAccessBoundary, "maxUnlockedGlobalNumber">,
) {
  return Boolean(session && session.globalNumber <= boundary.maxUnlockedGlobalNumber);
}

export function filterUnlockedHomework(
  homework: HomeworkItem[],
  sessions: StatusSession[],
  boundary = getSessionAccessBoundary(sessions),
) {
  const sessionById = new Map(sessions.map((session) => [session.id, session]));
  return homework.filter((item) => isSessionUnlocked(sessionById.get(item.sessionId), boundary));
}

export function filterUnlockedResources(
  resources: ResourceItem[],
  sessions: StatusSession[],
  boundary = getSessionAccessBoundary(sessions),
) {
  const sessionById = new Map(sessions.map((session) => [session.id, session]));
  const firstSessionByModule = new Map<string, StatusSession>();

  for (const session of [...sessions].sort((a, b) => a.globalNumber - b.globalNumber)) {
    if (!firstSessionByModule.has(session.moduleId)) {
      firstSessionByModule.set(session.moduleId, session);
    }
  }

  return resources.filter((item) => {
    const session = sessionById.get(item.sessionId);
    if (session) return isSessionUnlocked(session, boundary);
    return isSessionUnlocked(firstSessionByModule.get(item.moduleId), boundary);
  });
}

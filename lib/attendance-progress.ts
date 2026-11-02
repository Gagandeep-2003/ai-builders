import type { Batch, CourseLevel, CourseSession, StudentClassOccurrence } from "@/lib/course-data";
import type { CourseLevelCurriculum } from "@/lib/level-two";
import { dateKeyInTimeZone, getCurrentOrNextBatchClassOccurrence } from "@/lib/time";

function completedSessionIds(
  occurrences: StudentClassOccurrence[],
  level: CourseLevel,
) {
  return new Set(
    occurrences
      .filter(
        (occurrence) =>
          occurrence.status === "present" &&
          occurrence.courseLevel === level &&
          Boolean(occurrence.sessionId),
      )
      .map((occurrence) => occurrence.sessionId as string),
  );
}

/**
 * Attendance is the completion source of truth. Calendar time determines when
 * a class can be joined, but never marks a curriculum session complete.
 */
export function applyAttendanceDrivenProgress({
  curricula,
  occurrences,
  activeLevel,
  batch,
  now = new Date(),
}: {
  curricula: CourseLevelCurriculum[];
  occurrences: StudentClassOccurrence[];
  activeLevel: CourseLevel;
  batch: Batch;
  now?: Date;
}) {
  const nextOccurrence = getCurrentOrNextBatchClassOccurrence(batch, now);

  return curricula.map((curriculum) => {
    const completedIds = completedSessionIds(occurrences, curriculum.level);
    const eligible = curriculum.sessions.filter(
      (session) => session.status !== "skipped" && session.status !== "not_enrolled",
    );
    const firstIncompleteIndex = eligible.findIndex((session) => !completedIds.has(session.id));
    const currentSessionId = curriculum.level === activeLevel && firstIncompleteIndex >= 0
      ? eligible[firstIncompleteIndex]?.id
      : undefined;
    const projectedIndex = new Map(
      eligible
        .slice(Math.max(firstIncompleteIndex, 0))
        .map((session, index) => [session.id, index + 1]),
    );

    const sessions = curriculum.sessions.map((session): CourseSession & { status: typeof session.status } => {
      if (session.status === "skipped" || session.status === "not_enrolled") return session;
      if (completedIds.has(session.id)) return { ...session, status: "completed" };

      const isCurrent = session.id === currentSessionId;
      const projection = projectedIndex.get(session.id);
      if (curriculum.level === activeLevel && nextOccurrence && projection) {
        return {
          ...session,
          date: nextOccurrence.date,
          scheduleIndex: projection,
          scheduleStartsAt: nextOccurrence.startsAt.toISOString(),
          status: isCurrent ? "current" : "locked",
        };
      }

      return { ...session, status: isCurrent ? "current" : "locked" };
    });

    return {
      ...curriculum,
      sessions,
    };
  });
}

export function occurrenceAttendanceItems(occurrences: StudentClassOccurrence[]) {
  return occurrences.map((occurrence) => ({
      id: occurrence.id,
      sessionId: occurrence.sessionId ?? `extra:${occurrence.id}`,
      studentId: occurrence.studentId,
      status: occurrence.status,
      date: dateKeyInTimeZone(
        new Date(occurrence.scheduledStartsAt),
        occurrence.batchTimeZone,
      ),
    }));
}

export function totalAttendedClasses(occurrences: StudentClassOccurrence[]) {
  return occurrences.filter((occurrence) => occurrence.status === "present").length;
}

import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import {
  getAdminClassEvents,
  getNextClassEvent,
  getStudentClassEvents,
} from "@/lib/class-events";
import { getAdminShellData, getStudentShellData } from "@/lib/data";
import type { AdminPortalSummary, StudentPortalSummary } from "@/lib/portal-summary";
import { ADMIN_TIME_ZONE, formatInTimeZone } from "@/lib/time";

export const dynamic = "force-dynamic";

const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};

function dayKey(value: Date, timeZone: string) {
  return formatInTimeZone(value, timeZone, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401, headers: responseHeaders },
    );
  }

  if (profile.role === "admin") {
    const data = await getAdminShellData();
    const now = new Date();
    const today = dayKey(now, ADMIN_TIME_ZONE);
    const todayClasses = getAdminClassEvents({
      students: data.students,
      batches: data.batches,
      sessions: data.sessions,
      requests: data.rescheduleRequests,
      attendance: data.attendance,
      now,
    }).filter((event) => dayKey(event.startsAt, ADMIN_TIME_ZONE) === today).length;
    const summary: AdminPortalSummary = {
      role: "admin",
      todayClasses,
      pendingHomework: data.homework.reduce(
        (count, item) =>
          count +
          (item.submissions?.filter((submission) => submission.status === "submitted").length ?? 0),
        0,
      ),
      pendingReschedules: data.rescheduleRequests.filter((request) => request.status === "pending").length,
      pendingPasswords: data.passwordRequests.filter((request) => request.status === "pending").length,
      onlineStudents: data.students.filter((student) => {
        if (!student.lastSeenAt) return false;
        const seenAt = new Date(student.lastSeenAt).getTime();
        return Number.isFinite(seenAt) && now.getTime() - seenAt <= 2 * 60_000;
      }).length,
      unreadChatCount: data.unreadChatCount,
    };

    return NextResponse.json(summary, { headers: responseHeaders });
  }

  const data = await getStudentShellData();
  const nextClassEvent = getNextClassEvent(
    getStudentClassEvents({
      student: data.student,
      batch: data.batch,
      sessions: data.sessions,
      requests: data.rescheduleRequests,
    }),
  );
  const summary: StudentPortalSummary = {
    role: "student",
    pendingHomeworkCount: data.pendingHomeworkCount,
    unreadChatCount: data.unreadChatCount,
    classBadge: nextClassEvent
      ? {
          count: 1,
          tone: nextClassEvent.kind !== "regular" ? "accent" : "info",
          label:
            nextClassEvent.kind === "makeup"
              ? "Make-up class scheduled"
              : nextClassEvent.kind === "rescheduled"
                ? "Class rescheduled"
                : "Class link status available",
        }
      : undefined,
    unseenBadge: data.unseenBadge,
  };

  return NextResponse.json(summary, { headers: responseHeaders });
}

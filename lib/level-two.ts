import levelTwoCatalogJson from "@/data/level-two-curriculum.json";
import type {
  Batch,
  CourseLevel,
  CourseLevelState,
  CourseModule,
  CourseSession,
  CourseSessionStatus,
  HomeworkDetails,
  HomeworkItem,
  HomeworkKind,
  HomeworkSubmissionSummary,
  StudentCourseEnrollment,
  SubmissionStatus,
} from "@/lib/course-data";
import { getSessionDateTimes, getSessionScheduleDate } from "@/lib/time";

const LEVEL_TWO_HOMEWORK_DUE_DATE = "2027-05-31";

type CatalogActivity = {
  id: string;
  kind: HomeworkKind;
  number: number;
  order: number;
  title: string;
  source_name: string;
  document_id: string;
  document_title: string;
  document_url: string;
  overview: string;
  estimated_time: string;
  difficulty: string;
  primary_output: string;
  instructions: string[];
};

type CatalogSession = {
  id: string;
  number: number;
  title: string;
  source_label: string;
  folder_url: string;
  activities: CatalogActivity[];
};

type CatalogModule = {
  id: string;
  number: number;
  title: string;
  source_label: string;
  sessions: CatalogSession[];
};

type LevelTwoCatalog = {
  level: 2;
  title: string;
  modules: CatalogModule[];
};

export type CourseLevelCurriculum = {
  level: CourseLevel;
  state: CourseLevelState;
  enrollment?: StudentCourseEnrollment;
  modules: CourseModule[];
  sessions: Array<CourseSession & { status: CourseSessionStatus }>;
  skippedSessionCount: number;
};

export type LevelTwoSubmissionRow = {
  activityId: string;
  studentId: string;
  status: SubmissionStatus;
  notes?: string;
  startedAt?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  mentorFeedback?: string;
  timeSpentSeconds?: number;
  screenImage?: string;
  cameraImage?: string;
  proofText?: string;
  attachmentName?: string;
  attachmentMime?: string;
  attachmentData?: string;
  proofCapturedAt?: string;
  proofExpiresAt?: string;
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  deviceType?: string;
  userAgent?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  language?: string;
};

export const levelTwoCatalog = levelTwoCatalogJson as LevelTwoCatalog;

export const levelTwoModules: CourseModule[] = levelTwoCatalog.modules.map((module) => ({
  id: module.id,
  title: module.title,
  description: `Level 2 Module ${module.number}: ${module.title}. Eight guided agentic AI sessions with two class challenges and two home tasks per session.`,
  orderIndex: module.number,
  levelOrderIndex: module.number,
  sessionCount: module.sessions.length,
  courseLevel: 2,
}));

const catalogSessions = levelTwoCatalog.modules.flatMap((module) =>
  module.sessions.map((session) => ({ module, session })),
);

const activityById = new Map(
  catalogSessions.flatMap(({ module, session }) =>
    session.activities.map((activity) => [activity.id, { module, session, activity }] as const),
  ),
);

export function getLevelTwoActivity(activityId: string) {
  return activityById.get(activityId);
}

export function isLevelTwoActivityId(value: string) {
  return /^l2-m[1-3]-s[1-8]-(?:cc|ht)[1-2]$/.test(value);
}

export function isLevelTwoSessionId(value: string) {
  return /^l2-m[1-3]-s[1-8]$/.test(value);
}

export function levelSessionOrdinal(moduleNumber: number, sessionNumber: number) {
  return (moduleNumber - 1) * 8 + sessionNumber;
}

function catalogSessionToCourseSession(
  module: CatalogModule,
  session: CatalogSession,
): CourseSession {
  const ordinal = levelSessionOrdinal(module.number, session.number);
  const outputs = session.activities.map((activity) => activity.primary_output);
  return {
    id: session.id,
    moduleId: module.id,
    title: session.title,
    sessionNumber: session.number,
    globalNumber: ordinal,
    focus: session.activities.map((activity) => activity.overview).join(" "),
    toolsCovered: [],
    studentOutput: outputs.join(" · "),
    description: `${session.activities.length} guided activities: ${session.activities.map((activity) => activity.title).join(", ")}.`,
    date: "",
    courseLevel: 2,
    moduleNumber: module.number,
  };
}

export const levelTwoSessions: CourseSession[] = catalogSessions.map(({ module, session }) =>
  catalogSessionToCourseSession(module, session),
);

function courseLevelState(
  level: CourseLevel,
  enrollment: StudentCourseEnrollment | undefined,
  now: Date,
): CourseLevelState {
  if (enrollment?.status === "not_enrolled") return "not_enrolled";
  if (!enrollment) return level === 1 ? "current" : "not_enrolled";

  if (level === 1 && enrollment.endsAt) {
    return new Date(enrollment.endsAt).getTime() <= now.getTime() ? "completed" : "current";
  }
  if (enrollment.startsAt && new Date(enrollment.startsAt).getTime() > now.getTime()) {
    return "scheduled";
  }
  return "current";
}

export function buildLevelTwoCurriculum(
  batch: Batch,
  enrollment: StudentCourseEnrollment | undefined,
  now = new Date(),
): CourseLevelCurriculum {
  const startOrdinal = levelSessionOrdinal(
    enrollment?.startModuleNumber ?? 1,
    enrollment?.startSessionNumber ?? 1,
  );
  const enrollmentStartsAt = enrollment?.startsAt
    ? new Date(enrollment.startsAt).getTime()
    : Number.NaN;
  const startsInFuture = Number.isFinite(enrollmentStartsAt) && enrollmentStartsAt > now.getTime();
  let currentAssigned = false;

  const sessions = levelTwoSessions.map((baseSession) => {
    const ordinal = baseSession.globalNumber;
    if (!enrollment || enrollment.status === "not_enrolled") {
      return { ...baseSession, status: "not_enrolled" as const };
    }
    if (ordinal < startOrdinal) {
      return { ...baseSession, status: "skipped" as const };
    }

    const scheduled: CourseSession = {
      ...baseSession,
      scheduleIndex: ordinal - startOrdinal + 1,
      scheduleStartsAt: enrollment.startsAt,
    };
    const { endsAt } = getSessionDateTimes(scheduled, batch);
    const completed = !startsInFuture && endsAt.getTime() <= now.getTime();
    const status: CourseSessionStatus = startsInFuture
      ? "locked"
      : completed
        ? "completed"
        : currentAssigned
          ? "locked"
          : "current";
    if (!completed && !currentAssigned) currentAssigned = true;

    return {
      ...scheduled,
      date: getSessionScheduleDate(scheduled, batch),
      status,
    };
  });

  return {
    level: 2,
    state: courseLevelState(2, enrollment, now),
    enrollment,
    modules: levelTwoModules,
    sessions,
    skippedSessionCount: sessions.filter((session) => session.status === "skipped").length,
  };
}

export function buildLevelOneCurriculum(
  modules: CourseModule[],
  sessions: CourseSession[],
  batch: Batch,
  enrollment: StudentCourseEnrollment | undefined,
  now = new Date(),
): CourseLevelCurriculum {
  let currentAssigned = false;
  const notEnrolled = enrollment?.status === "not_enrolled";
  const endsAt = enrollment?.endsAt ? new Date(enrollment.endsAt) : null;

  const mappedSessions = sessions.map((baseSession) => {
    const session: CourseSession = {
      ...baseSession,
      courseLevel: 1,
      moduleNumber: baseSession.moduleNumber ?? Math.ceil(baseSession.globalNumber / 8),
    };
    if (notEnrolled) return { ...session, status: "not_enrolled" as const };

    const dateTimes = getSessionDateTimes(session, batch);
    if (endsAt && dateTimes.startsAt.getTime() >= endsAt.getTime()) {
      return { ...session, status: "skipped" as const };
    }

    const completed = dateTimes.endsAt.getTime() <= now.getTime();
    const status: CourseSessionStatus = completed
      ? "completed"
      : currentAssigned
        ? "locked"
        : "current";
    if (!completed && !currentAssigned) currentAssigned = true;
    return { ...session, date: getSessionScheduleDate(session, batch), status };
  });

  return {
    level: 1,
    state: courseLevelState(1, enrollment, now),
    enrollment,
    modules: modules.map((module) => ({
      ...module,
      courseLevel: 1,
      levelOrderIndex: module.levelOrderIndex ?? module.orderIndex,
    })),
    sessions: mappedSessions,
    skippedSessionCount: mappedSessions.filter((session) => session.status === "skipped").length,
  };
}

export function activeCourseLevel(
  enrollments: StudentCourseEnrollment[],
  now = new Date(),
): CourseLevel {
  const levelTwo = enrollments.find((enrollment) => enrollment.courseLevel === 2);
  const levelOne = enrollments.find((enrollment) => enrollment.courseLevel === 1);
  if (!levelTwo || levelTwo.status === "not_enrolled") return 1;
  if (levelOne?.status === "not_enrolled" || levelTwo.source === "direct") return 2;
  if (!levelTwo.startsAt) return 2;
  return new Date(levelTwo.startsAt).getTime() <= now.getTime() ? 2 : 1;
}

export function buildCourseCurricula({
  modules,
  sessions,
  batch,
  enrollments,
  includeLevelTwo,
  now = new Date(),
}: {
  modules: CourseModule[];
  sessions: CourseSession[];
  batch: Batch;
  enrollments: StudentCourseEnrollment[];
  includeLevelTwo: boolean;
  now?: Date;
}) {
  const levelOneEnrollment = enrollments.find((enrollment) => enrollment.courseLevel === 1);
  const levelTwoEnrollment = enrollments.find((enrollment) => enrollment.courseLevel === 2);
  const curricula: CourseLevelCurriculum[] = [
    buildLevelOneCurriculum(modules, sessions, batch, levelOneEnrollment, now),
  ];
  if (includeLevelTwo && levelTwoEnrollment) {
    curricula.push(buildLevelTwoCurriculum(batch, levelTwoEnrollment, now));
  }
  return curricula;
}

export function selectCourseCurriculum(
  curricula: CourseLevelCurriculum[],
  requestedLevel: string | undefined,
  activeLevel: CourseLevel,
) {
  const parsedLevel: CourseLevel = requestedLevel === "1" ? 1 : requestedLevel === "2" ? 2 : activeLevel;
  return curricula.find((curriculum) => curriculum.level === parsedLevel)
    ?? curricula.find((curriculum) => curriculum.level === activeLevel)
    ?? curricula[0];
}

export function courseLevelSwitcherItems(curricula: CourseLevelCurriculum[]) {
  return curricula.map((curriculum) => ({
    level: curriculum.level,
    state: curriculum.state,
    label: `Level ${curriculum.level}`,
  }));
}

export function buildLevelTwoHomework({
  batch,
  sessions,
  submissions,
  studentId,
}: {
  batch: Batch;
  sessions: Array<CourseSession & { status: CourseSessionStatus }>;
  submissions: LevelTwoSubmissionRow[];
  studentId: string;
}): HomeworkItem[] {
  const sessionMap = new Map(sessions.map((session) => [session.id, session]));
  const submissionMap = new Map(submissions.map((submission) => [submission.activityId, submission]));

  return catalogSessions.flatMap(({ module, session }) => {
    const courseSession = sessionMap.get(session.id);
    if (!courseSession) return [];
    const accessState = courseSession.status === "not_enrolled"
      ? "not_enrolled" as const
      : courseSession.status === "skipped"
        ? "skipped" as const
        : courseSession.status === "locked"
          ? "locked" as const
          : "available" as const;

    return session.activities.map((activity) => {
      const submission = submissionMap.get(activity.id);
      const details: HomeworkDetails = {
        moduleNumber: module.number,
        moduleTitle: module.title,
        sessionNumber: session.number,
        sessionTitle: session.title,
        whatStudentsLearn: activity.overview,
        tools: [],
        aiType: "Agentic AI",
        mission: activity.overview,
        instructions: activity.instructions,
        deliverables: [activity.primary_output],
        estimatedTime: activity.estimated_time,
        difficulty: activity.difficulty,
        primaryOutput: activity.primary_output,
        sourceName: activity.source_name,
        folderUrl: session.folder_url,
      };
      const summary: HomeworkSubmissionSummary | undefined = submission ? {
        studentId: submission.studentId,
        status: submission.status,
        startedAt: submission.startedAt,
        submittedAt: submission.submittedAt,
        timeSpentSeconds: submission.timeSpentSeconds,
        screenImage: submission.screenImage,
        cameraImage: submission.cameraImage,
        proofText: submission.proofText,
        attachmentName: submission.attachmentName,
        attachmentMime: submission.attachmentMime,
        attachmentData: submission.attachmentData,
        proofCapturedAt: submission.proofCapturedAt,
        proofExpiresAt: submission.proofExpiresAt,
        browserName: submission.browserName,
        browserVersion: submission.browserVersion,
        osName: submission.osName,
        deviceType: submission.deviceType,
        userAgent: submission.userAgent,
        viewportWidth: submission.viewportWidth,
        viewportHeight: submission.viewportHeight,
        language: submission.language,
        mentorFeedback: submission.mentorFeedback,
        reviewedAt: submission.reviewedAt,
        reviewedBy: submission.reviewedBy,
      } : undefined;

      return {
        id: activity.id,
        sessionId: session.id,
        batchId: batch.id,
        assignedStudentId: studentId,
        title: activity.title,
        description: activity.overview,
        details,
        kind: activity.kind,
        contentUrl: activity.document_url,
        dueDate: LEVEL_TWO_HOMEWORK_DUE_DATE,
        createdAt: "",
        sessionName: session.title,
        moduleId: module.id,
        status: submission?.status ?? "pending",
        notes: submission?.notes,
        mentorFeedback: submission?.mentorFeedback,
        reviewedAt: submission?.reviewedAt,
        startedAt: submission?.startedAt,
        submittedAt: submission?.submittedAt,
        timeSpentSeconds: submission?.timeSpentSeconds,
        submissions: summary ? [summary] : [],
        courseLevel: 2,
        moduleNumber: module.number,
        accessState,
        catalogManaged: true,
      } satisfies HomeworkItem;
    });
  });
}

export function buildAdminLevelTwoHomework(
  batch: Batch,
  submissions: LevelTwoSubmissionRow[],
) {
  const base = buildLevelTwoHomework({
    batch,
    sessions: levelTwoSessions.map((session) => ({ ...session, status: "current" as const })),
    submissions: [],
    studentId: "",
  });

  return base.map((item) => {
    const itemSubmissions = submissions
      .filter((submission) => submission.activityId === item.id)
      .map((submission): HomeworkSubmissionSummary => ({
        studentId: submission.studentId,
        status: submission.status,
        startedAt: submission.startedAt,
        submittedAt: submission.submittedAt,
        timeSpentSeconds: submission.timeSpentSeconds,
        screenImage: submission.screenImage,
        cameraImage: submission.cameraImage,
        proofText: submission.proofText,
        attachmentName: submission.attachmentName,
        attachmentMime: submission.attachmentMime,
        attachmentData: submission.attachmentData,
        proofCapturedAt: submission.proofCapturedAt,
        proofExpiresAt: submission.proofExpiresAt,
        browserName: submission.browserName,
        browserVersion: submission.browserVersion,
        osName: submission.osName,
        deviceType: submission.deviceType,
        userAgent: submission.userAgent,
        viewportWidth: submission.viewportWidth,
        viewportHeight: submission.viewportHeight,
        language: submission.language,
        mentorFeedback: submission.mentorFeedback,
        reviewedAt: submission.reviewedAt,
        reviewedBy: submission.reviewedBy,
      }));
    const aggregateStatus = itemSubmissions.some((submission) => submission.status === "revision_requested")
      ? "revision_requested" as const
      : itemSubmissions.some((submission) => submission.status === "submitted")
        ? "submitted" as const
        : itemSubmissions.some((submission) => submission.status === "reviewed")
          ? "reviewed" as const
          : "pending" as const;
    return {
      ...item,
      assignedStudentId: undefined,
      status: aggregateStatus,
      submissions: itemSubmissions,
      submittedCount: itemSubmissions.filter((submission) => ["submitted", "reviewed"].includes(submission.status)).length,
    };
  });
}

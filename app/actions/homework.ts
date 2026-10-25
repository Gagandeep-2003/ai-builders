"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthIdentity } from "@/lib/auth";
import { getStudentContextData } from "@/lib/data";
import { getLevelTwoActivity, isLevelTwoActivityId } from "@/lib/level-two";

type SubmissionClientInfo = {
  userAgent?: string;
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  deviceType?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  language?: string;
};

type HomeworkSubmitResult = {
  submitted: boolean;
  evidenceSaved: boolean;
  evidenceImagesSaved: boolean;
  evidenceMetadataSaved: boolean;
  error?: string;
};

type HomeworkAttachment = {
  name: string;
  mime: string;
  data: string;
};

const CLIENT_INFO_NOTE_PREFIX = "__client_info__:";

async function getStudentContext() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const identity = await getAuthIdentity();
  if (!identity) return null;

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", identity.userId)
    .single();

  if (!student) return null;
  return { supabase, studentId: student.id };
}

async function getLevelTwoWriteAccess(homeworkId: string, studentId: string) {
  if (!isLevelTwoActivityId(homeworkId)) return null;
  const catalogItem = getLevelTwoActivity(homeworkId);
  if (!catalogItem) return null;
  const context = await getStudentContextData();
  if (context.student.id !== studentId) return null;
  const levelTwo = context.curricula.find((curriculum) => curriculum.level === 2);
  const enrollment = levelTwo?.enrollment;
  const session = levelTwo?.sessions.find((item) => item.id === catalogItem.session.id);
  if (
    !enrollment ||
    enrollment.status !== "enrolled" ||
    !enrollment.startsAt ||
    new Date(enrollment.startsAt).getTime() > Date.now() ||
    !session ||
    (session.status !== "current" && session.status !== "completed")
  ) {
    return null;
  }
  return {
    module: catalogItem.module,
    catalogSession: catalogItem.session,
    activity: catalogItem.activity,
    courseSession: session,
  };
}

function revalidateHomework(homeworkId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/homework");
  revalidatePath(`/homework/${homeworkId}`);
  revalidatePath("/progress");
  revalidatePath("/admin/homework");
  revalidatePath("/admin");
}

function serializeClientInfoNote(clientInfo?: SubmissionClientInfo) {
  if (!clientInfo) return null;

  return `${CLIENT_INFO_NOTE_PREFIX}${JSON.stringify({
    userAgent: clientInfo.userAgent || "",
    browserName: clientInfo.browserName || "",
    browserVersion: clientInfo.browserVersion || "",
    osName: clientInfo.osName || "",
    deviceType: clientInfo.deviceType || "",
    viewportWidth: clientInfo.viewportWidth || null,
    viewportHeight: clientInfo.viewportHeight || null,
    language: clientInfo.language || "",
  })}`;
}

function getSubmissionNotesForClientInfo(existingNotes?: string | null, clientInfo?: SubmissionClientInfo) {
  const clientInfoNote = serializeClientInfoNote(clientInfo);
  if (!clientInfoNote) return existingNotes ?? null;
  if (!existingNotes || existingNotes.startsWith(CLIENT_INFO_NOTE_PREFIX)) return clientInfoNote;

  return existingNotes;
}

async function saveSubmissionEvidence({
  supabase,
  homeworkId,
  studentId,
  screenImage,
  cameraImage,
  proofText,
  attachment,
  clientInfo,
  now,
}: {
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>;
  homeworkId: string;
  studentId: string;
  screenImage?: string;
  cameraImage?: string;
  proofText?: string;
  attachment?: HomeworkAttachment;
  clientInfo?: SubmissionClientInfo;
  now: string;
}) {
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60_000).toISOString();
  const hasImages = Boolean(screenImage || cameraImage);
  const hasWorkEvidence = Boolean(proofText || attachment?.data);
  const hasMetadata = Boolean(clientInfo);

  if (!hasImages && !hasWorkEvidence && !hasMetadata) {
    return {
      saved: false,
      imagesSaved: false,
      metadataSaved: false,
    };
  }

  const fullPayload = {
    homework_id: homeworkId,
    student_id: studentId,
    screen_image: screenImage || null,
    camera_image: cameraImage || null,
    proof_text: proofText || null,
    attachment_name: attachment?.name || null,
    attachment_mime: attachment?.mime || null,
    attachment_data: attachment?.data || null,
    captured_at: now,
    expires_at: expiresAt,
    user_agent: clientInfo?.userAgent || null,
    browser_name: clientInfo?.browserName || null,
    browser_version: clientInfo?.browserVersion || null,
    os_name: clientInfo?.osName || null,
    device_type: clientInfo?.deviceType || null,
    viewport_width: clientInfo?.viewportWidth || null,
    viewport_height: clientInfo?.viewportHeight || null,
    language: clientInfo?.language || null,
  };

  const { error } = await supabase.from("submission_evidence").upsert(
    fullPayload,
    { onConflict: "homework_id,student_id" },
  );

  if (!error) {
    return {
      saved: true,
      imagesSaved: hasImages,
      metadataSaved: hasMetadata,
    };
  }

  const evidencePayload = {
    homework_id: homeworkId,
    student_id: studentId,
    screen_image: screenImage || null,
    camera_image: cameraImage || null,
    proof_text: proofText || null,
    attachment_name: attachment?.name || null,
    attachment_mime: attachment?.mime || null,
    attachment_data: attachment?.data || null,
    captured_at: now,
    expires_at: expiresAt,
  };

  const evidenceFallback = await supabase.from("submission_evidence").upsert(
    evidencePayload,
    { onConflict: "homework_id,student_id" },
  );

  if (!evidenceFallback.error) {
    return {
      saved: true,
      imagesSaved: hasImages,
      metadataSaved: false,
      error: error.message,
    };
  }

  const imageOnlyPayload = {
    homework_id: homeworkId,
    student_id: studentId,
    screen_image: screenImage || null,
    camera_image: cameraImage || null,
    captured_at: now,
    expires_at: expiresAt,
  };

  const fallback = await supabase.from("submission_evidence").upsert(
    imageOnlyPayload,
    { onConflict: "homework_id,student_id" },
  );

  if (!fallback.error) {
    return {
      saved: true,
      imagesSaved: hasImages,
      metadataSaved: false,
      error: evidenceFallback.error.message || error.message,
    };
  }

  const legacyPayload = {
    homework_id: homeworkId,
    student_id: studentId,
    screen_image: screenImage || null,
    camera_image: cameraImage || null,
    captured_at: now,
  };

  const legacyFallback = await supabase.from("submission_evidence").upsert(
    legacyPayload,
    { onConflict: "homework_id,student_id" },
  );

  if (!legacyFallback.error) {
    return {
      saved: true,
      imagesSaved: hasImages,
      metadataSaved: false,
      error: fallback.error.message || evidenceFallback.error.message || error.message,
    };
  }

  return {
    saved: false,
    imagesSaved: false,
    metadataSaved: false,
    error: legacyFallback.error.message || fallback.error.message || evidenceFallback.error.message || error.message,
  };
}

export async function markHomeworkStarted(homeworkId: string) {
  if (!homeworkId) return;

  const context = await getStudentContext();
  if (!context) return;

  const now = new Date().toISOString();
  if (isLevelTwoActivityId(homeworkId)) {
    const access = await getLevelTwoWriteAccess(homeworkId, context.studentId);
    if (!access) return;
    const { data: existing } = await context.supabase
      .from("course_activity_submissions")
      .select("id, started_at")
      .eq("activity_id", homeworkId)
      .eq("student_id", context.studentId)
      .maybeSingle();
    const { error } = existing
      ? existing.started_at
        ? { error: null }
        : await context.supabase
            .from("course_activity_submissions")
            .update({ started_at: now })
            .eq("id", existing.id)
      : await context.supabase.from("course_activity_submissions").insert({
          student_id: context.studentId,
          activity_id: homeworkId,
          module_number: access.module.number,
          session_number: access.catalogSession.number,
          kind: access.activity.kind,
          status: "pending",
          started_at: now,
        });
    if (error) console.error("Unable to start Level 2 activity", error);
    revalidateHomework(homeworkId);
    return;
  }
  const { data: existing } = await context.supabase
    .from("submissions")
    .select("id, started_at, notes")
    .eq("homework_id", homeworkId)
    .eq("student_id", context.studentId)
    .maybeSingle();

  if (existing) {
    if (!existing.started_at) {
      await context.supabase
        .from("submissions")
        .update({ started_at: now })
        .eq("id", existing.id);
    }
  } else {
    await context.supabase.from("submissions").insert({
      homework_id: homeworkId,
      student_id: context.studentId,
      status: "pending",
      started_at: now,
    });
  }

}

export async function markHomeworkSubmitted(formData: FormData) {
  const homeworkId = String(formData.get("homeworkId") ?? "");
  await markHomeworkSubmittedById(homeworkId);
}

export async function markHomeworkSubmittedById(homeworkId: string) {
  if (!homeworkId || !isSupabaseConfigured()) {
    revalidatePath("/homework");
    return;
  }

  const context = await getStudentContext();
  if (!context) return;

  const now = new Date().toISOString();
  if (isLevelTwoActivityId(homeworkId)) {
    const access = await getLevelTwoWriteAccess(homeworkId, context.studentId);
    if (!access) return;
    const { data: existing } = await context.supabase
      .from("course_activity_submissions")
      .select("started_at")
      .eq("activity_id", homeworkId)
      .eq("student_id", context.studentId)
      .maybeSingle();
    const { error } = await context.supabase.from("course_activity_submissions").upsert({
      student_id: context.studentId,
      activity_id: homeworkId,
      module_number: access.module.number,
      session_number: access.catalogSession.number,
      kind: access.activity.kind,
      status: "submitted",
      started_at: existing?.started_at ?? now,
      submitted_at: now,
    }, { onConflict: "student_id,activity_id" });
    if (error) console.error("Unable to submit Level 2 activity", error);
    revalidateHomework(homeworkId);
    return;
  }
  const { data: existing } = await context.supabase
    .from("submissions")
    .select("id, started_at")
    .eq("homework_id", homeworkId)
    .eq("student_id", context.studentId)
    .maybeSingle();

  if (existing) {
    await context.supabase
      .from("submissions")
      .update({
        status: "submitted",
        started_at: existing.started_at ?? now,
        submitted_at: now,
        reviewed_at: null,
        reviewed_by: null,
        mentor_feedback: null,
      })
      .eq("id", existing.id);
  } else {
    await context.supabase.from("submissions").insert({
      homework_id: homeworkId,
      student_id: context.studentId,
      status: "submitted",
      started_at: now,
      submitted_at: now,
    });
  }

  revalidateHomework(homeworkId);
}

export async function markHomeworkSubmittedWithEvidence(
  homeworkId: string,
  screenImage?: string,
  cameraImage?: string,
  clientInfo?: SubmissionClientInfo,
  proofText?: string,
  attachment?: HomeworkAttachment,
): Promise<HomeworkSubmitResult> {
  if (!homeworkId || !isSupabaseConfigured()) {
    revalidatePath("/homework");
    return {
      submitted: false,
      evidenceSaved: false,
      evidenceImagesSaved: false,
      evidenceMetadataSaved: false,
      error: "Homework could not be submitted because Supabase is not configured.",
    };
  }

  const context = await getStudentContext();
  if (!context) {
    return {
      submitted: false,
      evidenceSaved: false,
      evidenceImagesSaved: false,
      evidenceMetadataSaved: false,
      error: "Could not identify the current student.",
    };
  }

  const now = new Date().toISOString();
  const cleanProofText = proofText?.trim().slice(0, 8000) || "";
  const cleanAttachment = attachment?.data
    ? {
        name: attachment.name.slice(0, 160),
        mime: attachment.mime.slice(0, 120),
        data: attachment.data,
      }
    : undefined;
  const hasCapturedProof = Boolean(screenImage || cameraImage || cleanProofText || cleanAttachment);

  if (isLevelTwoActivityId(homeworkId)) {
    const access = await getLevelTwoWriteAccess(homeworkId, context.studentId);
    if (!access) {
      return {
        submitted: false,
        evidenceSaved: false,
        evidenceImagesSaved: false,
        evidenceMetadataSaved: false,
        error: "This Level 2 activity is not available in your current course placement.",
      };
    }
    const { data: existing } = await context.supabase
      .from("course_activity_submissions")
      .select("started_at, notes")
      .eq("activity_id", homeworkId)
      .eq("student_id", context.studentId)
      .maybeSingle();
    const startedAt = existing?.started_at ?? now;
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60_000).toISOString();
    const { error } = await context.supabase.from("course_activity_submissions").upsert({
      student_id: context.studentId,
      activity_id: homeworkId,
      module_number: access.module.number,
      session_number: access.catalogSession.number,
      kind: access.activity.kind,
      status: "submitted",
      notes: getSubmissionNotesForClientInfo(existing?.notes, clientInfo),
      started_at: startedAt,
      submitted_at: now,
      time_spent_seconds: Math.max(0, Math.round((new Date(now).getTime() - new Date(startedAt).getTime()) / 1000)),
      screen_image: screenImage || null,
      camera_image: cameraImage || null,
      proof_text: cleanProofText || null,
      attachment_name: cleanAttachment?.name || null,
      attachment_mime: cleanAttachment?.mime || null,
      attachment_data: cleanAttachment?.data || null,
      captured_at: hasCapturedProof ? now : null,
      expires_at: hasCapturedProof ? expiresAt : null,
      user_agent: clientInfo?.userAgent || null,
      browser_name: clientInfo?.browserName || null,
      browser_version: clientInfo?.browserVersion || null,
      os_name: clientInfo?.osName || null,
      device_type: clientInfo?.deviceType || null,
      viewport_width: clientInfo?.viewportWidth || null,
      viewport_height: clientInfo?.viewportHeight || null,
      language: clientInfo?.language || null,
    }, { onConflict: "student_id,activity_id" });
    if (error) {
      return {
        submitted: false,
        evidenceSaved: false,
        evidenceImagesSaved: false,
        evidenceMetadataSaved: false,
        error: error.message,
      };
    }
    revalidateHomework(homeworkId);
    return {
      submitted: true,
      evidenceSaved: hasCapturedProof,
      evidenceImagesSaved: Boolean(screenImage || cameraImage),
      evidenceMetadataSaved: Boolean(clientInfo),
    };
  }

  const evidence = await saveSubmissionEvidence({
    supabase: context.supabase,
    homeworkId,
    studentId: context.studentId,
    screenImage,
    cameraImage,
    proofText: cleanProofText,
    attachment: cleanAttachment,
    clientInfo,
    now,
  });

  if (hasCapturedProof && !evidence.saved) {
    return {
      submitted: false,
      evidenceSaved: false,
      evidenceImagesSaved: false,
      evidenceMetadataSaved: false,
      error: `Proof was captured but could not be saved. ${evidence.error ?? "Please run the submission evidence migration and try again."}`,
    };
  }

  const { data: existing } = await context.supabase
    .from("submissions")
    .select("id, started_at, notes")
    .eq("homework_id", homeworkId)
    .eq("student_id", context.studentId)
    .maybeSingle();

  if (existing) {
    const { error } = await context.supabase
      .from("submissions")
      .update({
        status: "submitted",
        started_at: existing.started_at ?? now,
        submitted_at: now,
        reviewed_at: null,
        reviewed_by: null,
        mentor_feedback: null,
        notes: getSubmissionNotesForClientInfo(existing.notes, clientInfo),
      })
      .eq("id", existing.id);

    if (error) {
      return {
        submitted: false,
        evidenceSaved: evidence.saved,
        evidenceImagesSaved: evidence.imagesSaved,
        evidenceMetadataSaved: evidence.metadataSaved,
        error: error.message,
      };
    }
  } else {
    const { error } = await context.supabase.from("submissions").insert({
      homework_id: homeworkId,
      student_id: context.studentId,
      status: "submitted",
      started_at: now,
      submitted_at: now,
      reviewed_at: null,
      reviewed_by: null,
      mentor_feedback: null,
      notes: getSubmissionNotesForClientInfo(null, clientInfo),
    });

    if (error) {
      return {
        submitted: false,
        evidenceSaved: evidence.saved,
        evidenceImagesSaved: evidence.imagesSaved,
        evidenceMetadataSaved: evidence.metadataSaved,
        error: error.message,
      };
    }
  }

  revalidateHomework(homeworkId);

  return {
    submitted: true,
    evidenceSaved: evidence.saved,
    evidenceImagesSaved: evidence.imagesSaved,
    evidenceMetadataSaved: evidence.metadataSaved,
    error: evidence.error,
  };
}

export async function resetHomeworkProgress(homeworkId: string) {
  if (!homeworkId || !isSupabaseConfigured()) {
    revalidatePath("/homework");
    return;
  }

  const context = await getStudentContext();
  if (!context) return;

  if (isLevelTwoActivityId(homeworkId)) {
    const access = await getLevelTwoWriteAccess(homeworkId, context.studentId);
    if (!access) return;
    await context.supabase
      .from("course_activity_submissions")
      .update({
        status: "pending",
        notes: null,
        started_at: null,
        submitted_at: null,
        time_spent_seconds: null,
        screen_image: null,
        camera_image: null,
        proof_text: null,
        attachment_name: null,
        attachment_mime: null,
        attachment_data: null,
        captured_at: null,
        expires_at: null,
        user_agent: null,
        browser_name: null,
        browser_version: null,
        os_name: null,
        device_type: null,
        viewport_width: null,
        viewport_height: null,
        language: null,
      })
      .eq("activity_id", homeworkId)
      .eq("student_id", context.studentId)
      .neq("status", "reviewed");
    revalidateHomework(homeworkId);
    return;
  }

  await context.supabase
    .from("submissions")
    .update({
      status: "pending",
      notes: null,
      started_at: null,
      submitted_at: null,
      reviewed_at: null,
      reviewed_by: null,
      mentor_feedback: null,
    })
    .eq("homework_id", homeworkId)
    .eq("student_id", context.studentId)
    .neq("status", "reviewed");

  revalidateHomework(homeworkId);
}

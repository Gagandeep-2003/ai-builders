"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

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

async function getStudentContext() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!student) return null;
  return { supabase, studentId: student.id };
}

async function saveSubmissionEvidence({
  supabase,
  homeworkId,
  studentId,
  screenImage,
  cameraImage,
  clientInfo,
  now,
}: {
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>;
  homeworkId: string;
  studentId: string;
  screenImage?: string;
  cameraImage?: string;
  clientInfo?: SubmissionClientInfo;
  now: string;
}) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60_000).toISOString();
  const hasImages = Boolean(screenImage || cameraImage);
  const hasMetadata = Boolean(clientInfo);

  if (!hasImages && !hasMetadata) {
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
      error: error.message,
    };
  }

  return {
    saved: false,
    imagesSaved: false,
    metadataSaved: false,
    error: fallback.error.message || error.message,
  };
}

export async function markHomeworkStarted(homeworkId: string) {
  if (!homeworkId) return;

  const context = await getStudentContext();
  if (!context) return;

  const now = new Date().toISOString();
  await context.supabase
    .from("submission_evidence")
    .delete()
    .eq("student_id", context.studentId)
    .lt("expires_at", now);
  const { data: existing } = await context.supabase
    .from("submissions")
    .select("id, started_at")
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

  revalidatePath("/homework");
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

  revalidatePath("/dashboard");
  revalidatePath("/homework");
  revalidatePath(`/homework/${homeworkId}`);
  revalidatePath("/progress");
}

export async function markHomeworkSubmittedWithEvidence(
  homeworkId: string,
  screenImage?: string,
  cameraImage?: string,
  clientInfo?: SubmissionClientInfo,
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
  const hasCapturedProof = Boolean(screenImage || cameraImage);
  const evidence = await saveSubmissionEvidence({
    supabase: context.supabase,
    homeworkId,
    studentId: context.studentId,
    screenImage,
    cameraImage,
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
    .select("id, started_at")
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

  revalidatePath("/dashboard");
  revalidatePath("/homework");
  revalidatePath(`/homework/${homeworkId}`);
  revalidatePath("/progress");
  revalidatePath("/admin/homework");
  revalidatePath("/admin");

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

  await context.supabase
    .from("submissions")
    .update({
      status: "pending",
      notes: null,
      started_at: null,
      submitted_at: null,
      reviewed_at: null,
    })
    .eq("homework_id", homeworkId)
    .eq("student_id", context.studentId)
    .neq("status", "reviewed");

  revalidatePath("/dashboard");
  revalidatePath("/homework");
  revalidatePath(`/homework/${homeworkId}`);
  revalidatePath("/progress");
}

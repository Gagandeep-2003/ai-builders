"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

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
) {
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

  if (screenImage || cameraImage) {
    await context.supabase.from("submission_evidence").upsert(
      {
        homework_id: homeworkId,
        student_id: context.studentId,
        screen_image: screenImage || null,
        camera_image: cameraImage || null,
        captured_at: now,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60_000).toISOString(),
      },
      { onConflict: "homework_id,student_id" },
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/homework");
  revalidatePath(`/homework/${homeworkId}`);
  revalidatePath("/progress");
  revalidatePath("/admin/homework");
  revalidatePath("/admin");
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

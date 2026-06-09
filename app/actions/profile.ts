"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

async function getCurrentStudentId() {
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
    .maybeSingle();

  return student?.id ? { supabase, studentId: student.id } : null;
}

export async function requestPasswordChangeAction(formData: FormData) {
  const context = await getCurrentStudentId();
  if (!context) {
    revalidatePath("/profile");
    return;
  }

  const reason = String(formData.get("reason") ?? "").trim();

  const { data: existing } = await context.supabase
    .from("password_change_requests")
    .select("id")
    .eq("student_id", context.studentId)
    .in("status", ["pending", "approved"])
    .is("used_at", null)
    .limit(1)
    .maybeSingle();

  if (!existing) {
    await context.supabase.from("password_change_requests").insert({
      student_id: context.studentId,
      reason,
      status: "pending",
    });
  }

  revalidatePath("/profile");
  revalidatePath("/admin");
}

export async function updateStudentContactAction(formData: FormData) {
  const context = await getCurrentStudentId();
  if (!context) {
    revalidatePath("/profile");
    return;
  }

  const parentName = String(formData.get("parentName") ?? "").trim();
  const parentEmail = String(formData.get("parentEmail") ?? "").trim().toLowerCase();
  const country = String(formData.get("country") ?? "").trim();

  if (!parentName || !parentEmail || !country || !parentEmail.includes("@")) {
    revalidatePath("/profile");
    return;
  }

  const { error } = await context.supabase.rpc("update_own_student_contact", {
    parent_name_input: parentName,
    parent_email_input: parentEmail,
    country_input: country,
  });

  if (error) {
    await context.supabase
      .from("students")
      .update({
        parent_name: parentName,
        parent_email: parentEmail,
        country,
      })
      .eq("id", context.studentId);
  }

  revalidatePath("/profile");
  revalidatePath("/admin/students");
  revalidatePath("/admin");
}

export async function changeApprovedPasswordAction(formData: FormData) {
  const context = await getCurrentStudentId();
  if (!context) {
    revalidatePath("/profile");
    return;
  }

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8 || password !== confirmPassword) {
    revalidatePath("/profile");
    return;
  }

  const { data: request } = await context.supabase
    .from("password_change_requests")
    .select("id")
    .eq("student_id", context.studentId)
    .eq("status", "approved")
    .is("used_at", null)
    .order("reviewed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!request) {
    revalidatePath("/profile");
    return;
  }

  const { error } = await context.supabase.auth.updateUser({ password });
  if (!error) {
    await context.supabase.rpc("mark_password_request_used", { request_id: request.id });
  }

  revalidatePath("/profile");
  revalidatePath("/admin");
}

"use server";

import { revalidatePath } from "next/cache";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type ProfileActionState = {
  ok: boolean;
  message: string;
  values?: {
    parentName: string;
    parentEmail: string;
    country: string;
  };
};

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

export async function requestPasswordChangeAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const context = await getCurrentStudentId();
  if (!context) {
    revalidatePath("/profile");
    return { ok: false, message: "Please sign in again before requesting a password change." };
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
    const { error } = await context.supabase.from("password_change_requests").insert({
      student_id: context.studentId,
      reason,
      status: "pending",
    });

    if (error) {
      revalidatePath("/profile");
      return {
        ok: false,
        message: "Could not send the request. Please ask admin to check the password request table policy.",
      };
    }
  }

  revalidatePath("/profile");
  revalidatePath("/admin");
  return existing
    ? { ok: true, message: "You already have an active password change request." }
    : { ok: true, message: "Password change request sent for admin approval." };
}

export async function updateStudentContactAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const context = await getCurrentStudentId();
  if (!context) {
    revalidatePath("/profile");
    return { ok: false, message: "Please sign in again before saving profile details." };
  }

  const parentName = String(formData.get("parentName") ?? "").trim();
  const parentEmail = String(formData.get("parentEmail") ?? "").trim().toLowerCase();
  const country = String(formData.get("country") ?? "").trim();

  if (!parentName || !parentEmail || !country || !parentEmail.includes("@")) {
    revalidatePath("/profile");
    return { ok: false, message: "Please enter a valid parent name, parent email, and country." };
  }

  const { error: rpcError } = await context.supabase.rpc("update_own_student_contact", {
    parent_name_input: parentName,
    parent_email_input: parentEmail,
    country_input: country,
  });

  const serviceSupabase = createServiceRoleSupabaseClient();
  let studentTableSaved = !rpcError;

  if (rpcError && serviceSupabase) {
    const { error: serviceError } = await serviceSupabase
      .from("students")
      .update({
        parent_name: parentName,
        parent_email: parentEmail,
        country,
      })
      .eq("id", context.studentId);

    studentTableSaved = !serviceError;
  }

  // The auth metadata belongs to the signed-in student and does not require a
  // service-role key. Keep it as a durable self-service fallback while older
  // deployments are waiting for the profile RPC migration.
  if (!studentTableSaved) {
    const { error: metadataError } = await context.supabase.auth.updateUser({
      data: {
        student_contact: {
          parentName,
          parentEmail,
          country,
        },
      },
    });

    if (metadataError) {
      console.error("[profile.contact] Unable to save student contact", {
        rpcCode: rpcError?.code,
        metadataCode: metadataError.code,
      });
      revalidatePath("/profile");
      return {
        ok: false,
        message: "Could not save profile details. Please sign out, sign back in, and try once more.",
      };
    }
  }

  revalidatePath("/profile");
  revalidatePath("/admin/students");
  revalidatePath("/admin");
  return {
    ok: true,
    message: "Profile details updated.",
    values: {
      parentName,
      parentEmail,
      country,
    },
  };
}

export async function changeApprovedPasswordAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const context = await getCurrentStudentId();
  if (!context) {
    revalidatePath("/profile");
    return { ok: false, message: "Please sign in again before changing your password." };
  }

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8 || password !== confirmPassword) {
    revalidatePath("/profile");
    return {
      ok: false,
      message: "Passwords must match and be at least 8 characters.",
    };
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
    return { ok: false, message: "No approved password change request is available yet." };
  }

  const { error } = await context.supabase.auth.updateUser({ password });
  if (error) {
    revalidatePath("/profile");
    return { ok: false, message: "Could not update password. Please try signing in again." };
  }

  const { error: markUsedError } = await context.supabase.rpc("mark_password_request_used", {
    request_id: request.id,
  });

  if (markUsedError) {
    revalidatePath("/profile");
    return {
      ok: false,
      message:
        "Password changed, but the approval could not be marked used. Please tell admin before requesting again.",
    };
  }

  revalidatePath("/profile");
  revalidatePath("/admin");
  return { ok: true, message: "Password updated successfully." };
}

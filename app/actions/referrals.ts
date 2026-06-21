"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ReferralStatus } from "@/lib/course-data";

export type ReferralActionState = {
  ok: boolean;
  message: string;
};

async function getStudentContext() {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "student" && profile.role !== "admin")) return null;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", profile.id)
    .maybeSingle();
  return student?.id ? { supabase, studentId: student.id } : null;
}

export async function createReferralAction(
  _previousState: ReferralActionState,
  formData: FormData,
): Promise<ReferralActionState> {
  const context = await getStudentContext();
  if (!context) return { ok: false, message: "Please sign in again before sending a referral." };

  const referredName = String(formData.get("referredName") ?? "").trim();
  const referredContact = String(formData.get("referredContact") ?? "").trim();
  const relationship = String(formData.get("relationship") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!referredName || !referredContact || !relationship) {
    return { ok: false, message: "Add the person’s name, contact detail, and relationship." };
  }

  const { error } = await context.supabase.from("referrals").insert({
    student_id: context.studentId,
    referred_name: referredName,
    referred_contact: referredContact,
    relationship,
    note,
    status: "pending",
  });

  if (error) {
    return {
      ok: false,
      message: error.code === "42P01"
        ? "Referral setup is not active yet. Run the referrals migration in Supabase."
        : "The referral could not be saved. Please try again.",
    };
  }

  revalidatePath("/referrals");
  revalidatePath("/admin/referrals");
  return {
    ok: true,
    message: "Referral sent. Your mentor will review it and update the status here.",
  };
}

export async function updateReferralAction(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") return;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return;

  const referralId = String(formData.get("referralId") ?? "");
  const status = String(formData.get("status") ?? "") as ReferralStatus;
  const adminNote = String(formData.get("adminNote") ?? "").trim();
  const allowed: ReferralStatus[] = ["pending", "contacted", "enrolled", "rewarded", "closed"];
  if (!referralId || !allowed.includes(status)) return;

  await supabase
    .from("referrals")
    .update({
      status,
      admin_note: adminNote,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", referralId);

  revalidatePath("/admin/referrals");
  revalidatePath("/referrals");
}

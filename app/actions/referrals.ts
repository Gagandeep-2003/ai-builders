"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";
import type { ReferralStatus, ReferralSubmission } from "@/lib/course-data";

export type ReferralActionState = {
  ok: boolean;
  message: string;
  referral?: ReferralSubmission;
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

  if (
    referredName.length > 120 ||
    referredContact.length > 320 ||
    relationship.length > 64 ||
    note.length > 2000
  ) {
    return { ok: false, message: "Please shorten the referral details and try again." };
  }

  const { data: rpcReferralId, error: rpcError } = await context.supabase.rpc(
    "create_own_referral",
    {
      referred_name_input: referredName,
      referred_contact_input: referredContact,
      relationship_input: relationship,
      note_input: note || null,
    },
  );

  let referralId = typeof rpcReferralId === "string" ? rpcReferralId : "";
  let saveError = rpcError;

  // Mixed-version fallback: the original referrals migration allowed students
  // to insert their own row through RLS before the dedicated RPC existed.
  if (rpcError?.code === "PGRST202" || rpcError?.code === "42883") {
    const { data, error } = await context.supabase
      .from("referrals")
      .insert({
        student_id: context.studentId,
        referred_name: referredName,
        referred_contact: referredContact,
        relationship,
        note,
        status: "pending",
      })
      .select("id")
      .single();
    referralId = data?.id ?? "";
    saveError = error;
  }

  if (saveError) {
    const serviceSupabase = createServiceRoleSupabaseClient();
    if (serviceSupabase) {
      const { data, error } = await serviceSupabase
        .from("referrals")
        .insert({
          student_id: context.studentId,
          referred_name: referredName,
          referred_contact: referredContact,
          relationship,
          note,
          status: "pending",
        })
        .select("id")
        .single();
      referralId = data?.id ?? "";
      saveError = error;
    }
  }

  if (saveError || !referralId) {
    console.error("[referral.create] Unable to save referral", {
      code: saveError?.code,
      message: saveError?.message,
    });
    return {
      ok: false,
      message:
        saveError?.code === "42P01" || saveError?.code === "PGRST205"
          ? "Referral setup is not active yet. Admin needs to run the student portal self-service migration once."
          : "The referral could not be saved. Please try again or ask admin to check the referral setup.",
    };
  }

  const createdAt = new Date().toISOString();

  revalidatePath("/referrals");
  revalidatePath("/admin/referrals");
  return {
    ok: true,
    message: "Referral submitted. Your $100 reward tracker will update as your mentor contacts the new learner and confirms eligibility.",
    referral: {
      id: referralId,
      studentId: context.studentId,
      studentName: "",
      referredName,
      referredContact,
      relationship,
      note,
      status: "pending",
      adminNote: "",
      createdAt,
      reviewedAt: "",
    },
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

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export type DemoRequestStatus = "new" | "contacted" | "scheduled" | "closed";

export type DemoRequestActionState = {
  ok: boolean;
  message: string;
};

const successMessage =
  "Your request is in. We will contact you personally to arrange a suitable demo time.";

function value(formData: FormData, name: string, maxLength: number) {
  return String(formData.get(name) ?? "").trim().slice(0, maxLength);
}

function isEmail(input: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

export async function createDemoRequestAction(
  _previousState: DemoRequestActionState,
  formData: FormData,
): Promise<DemoRequestActionState> {
  if (value(formData, "website", 120)) {
    return { ok: true, message: successMessage };
  }

  const parentName = value(formData, "parentName", 120);
  const studentName = value(formData, "studentName", 120);
  const email = value(formData, "email", 180).toLowerCase();
  const phone = value(formData, "phone", 40);
  const country = value(formData, "country", 100);
  const timeZone = value(formData, "timeZone", 80) || "UTC";
  const goals = value(formData, "goals", 1500);
  const preferredSchedule = value(formData, "preferredSchedule", 500);
  const ageInput = value(formData, "studentAge", 3);
  const studentAge = ageInput ? Number(ageInput) : null;

  if (!parentName || !studentName || !email || !country || !goals || !preferredSchedule) {
    return { ok: false, message: "Please complete all required fields." };
  }

  if (!isEmail(email)) {
    return { ok: false, message: "Please enter a valid parent email address." };
  }

  if (
    studentAge !== null &&
    (!Number.isInteger(studentAge) || studentAge < 6 || studentAge > 21)
  ) {
    return { ok: false, message: "Student age must be between 6 and 21." };
  }

  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) {
    return {
      ok: false,
      message: "Demo requests are temporarily unavailable. Please try again shortly.",
    };
  }

  const tenMinutesAgo = new Date(Date.now() - 10 * 60_000).toISOString();
  const { data: recentRequest } = await supabase
    .from("demo_requests")
    .select("id")
    .eq("email", email)
    .gte("created_at", tenMinutesAgo)
    .limit(1)
    .maybeSingle();

  if (recentRequest) {
    return { ok: true, message: successMessage };
  }

  const { error } = await supabase.from("demo_requests").insert({
    parent_name: parentName,
    student_name: studentName,
    email,
    phone: phone || null,
    student_age: studentAge,
    country,
    time_zone: timeZone,
    goals,
    preferred_schedule: preferredSchedule,
  });

  if (error) {
    console.error("Unable to create demo request", {
      code: error.code,
      message: error.message,
    });
    return {
      ok: false,
      message: "We could not save your request right now. Please try again shortly.",
    };
  }

  revalidatePath("/admin/demo-requests");
  return { ok: true, message: successMessage };
}

export async function updateDemoRequestAction(formData: FormData) {
  await requireAdmin();

  const id = value(formData, "id", 80);
  const status = value(formData, "status", 20) as DemoRequestStatus;
  const adminNote = value(formData, "adminNote", 1500);
  const allowedStatuses: DemoRequestStatus[] = [
    "new",
    "contacted",
    "scheduled",
    "closed",
  ];

  if (!id || !allowedStatuses.includes(status)) {
    return;
  }

  const supabase = createServiceRoleSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase service role access is not configured.");
  }

  const { error } = await supabase
    .from("demo_requests")
    .update({
      status,
      admin_note: adminNote || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error("The demo request could not be updated.");
  }

  revalidatePath("/admin/demo-requests");
}

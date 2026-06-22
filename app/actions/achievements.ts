"use server";

import { revalidatePath } from "next/cache";
import { getAuthIdentity } from "@/lib/auth";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";

export async function acknowledgeBadgeAction(awardId: string) {
  if (!awardId) return { ok: false };
  const identity = await getAuthIdentity();
  if (!identity) return { ok: false };

  const serviceClient = createServiceRoleSupabaseClient();
  if (serviceClient) {
    const { data: student } = await serviceClient
      .from("students")
      .select("id")
      .eq("user_id", identity.userId)
      .maybeSingle();

    if (!student) return { ok: false };

    const { error } = await serviceClient
      .from("student_badges")
      .update({ seen_at: new Date().toISOString() })
      .eq("id", awardId)
      .eq("student_id", student.id)
      .is("seen_at", null);

    if (!error) {
      revalidateAchievementPaths();
      return { ok: true };
    }
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false };
  const { error } = await supabase.rpc("acknowledge_student_badge", {
    target_award_id: awardId,
  });
  if (error) {
    console.error("Could not acknowledge achievement", error.message);
    return { ok: false };
  }

  revalidateAchievementPaths();
  return { ok: true };
}

function revalidateAchievementPaths() {
  for (const path of ["/dashboard", "/progress", "/journey", "/league"]) revalidatePath(path);
}

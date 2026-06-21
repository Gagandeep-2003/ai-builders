"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function acknowledgeBadgeAction(awardId: string) {
  if (!awardId) return;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return;
  await supabase.rpc("acknowledge_student_badge", { target_award_id: awardId });
  for (const path of ["/dashboard", "/progress", "/journey", "/league"]) revalidatePath(path);
}

"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthIdentity } from "@/lib/auth";

export async function touchPresenceAction() {
  if (!isSupabaseConfigured()) return;

  const supabase = await createServerSupabaseClient();
  if (!supabase) return;

  const identity = await getAuthIdentity();
  if (!identity) return;

  await supabase
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", identity.userId);
}

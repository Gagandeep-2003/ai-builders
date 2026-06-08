"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseEnv } from "./config";

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = requireSupabaseEnv();
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

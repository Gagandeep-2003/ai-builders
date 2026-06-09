"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseEnv } from "./config";
import { authCookieOptions } from "./cookies";

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = requireSupabaseEnv();
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: authCookieOptions,
  });
}

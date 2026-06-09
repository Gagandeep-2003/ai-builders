"use server";

import { redirect } from "next/navigation";
import { getDemoProfileFallback } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type LoginState = {
  error?: string;
};

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter both email and password." };
  }

  if (!isSupabaseConfigured()) {
    return { error: "Authentication is unavailable. Please contact your course administrator." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { error: "Supabase is not configured." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "The email or password is incorrect." };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Could not load the signed-in user." };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    const fallback = getDemoProfileFallback(user.email, user.id);
    if (fallback) {
      if (fallback.role === "admin") redirect("/admin");
      redirect("/dashboard");
    }

    await supabase.auth.signOut();
    if (profileError.code === "42501") {
      return {
        error:
          "Login works, but database grants are missing. Run supabase/grants.sql, then supabase/seed.sql.",
      };
    }

    return { error: `Login works, but profile lookup failed: ${profileError.message}` };
  }

  if (!profile) {
    const fallback = getDemoProfileFallback(user.email, user.id);
    if (fallback) {
      if (fallback.role === "admin") redirect("/admin");
      redirect("/dashboard");
    }

    await supabase.auth.signOut();
    return {
      error:
        "Login works, but no app profile exists yet. Run the hosted supabase/seed.sql after creating auth users.",
    };
  }

  if (profile?.role === "admin") redirect("/admin");
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/login");
}

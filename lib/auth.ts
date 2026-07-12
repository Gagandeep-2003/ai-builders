import { redirect } from "next/navigation";
import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { demoStudent, type Role } from "@/lib/course-data";

const demoRoleFallbacks: Record<string, AppProfile> = {
  "student@demo.com": {
    id: demoStudent.userId,
    email: "student@demo.com",
    fullName: demoStudent.fullName,
    role: "student",
  },
  "admin@bootcamp.com": {
    id: "admin-demo-fallback",
    email: "admin@bootcamp.com",
    fullName: "AI Builders Admin",
    role: "admin",
  },
};

export type AppProfile = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
};

export type AuthIdentity = {
  userId: string;
  email: string | null;
  userMetadata: unknown;
};

export function getDemoProfileFallback(email?: string | null, id?: string): AppProfile | null {
  if (!email) return null;
  const fallback = demoRoleFallbacks[email.toLowerCase()];
  if (!fallback) return null;

  return {
    ...fallback,
    id: id ?? fallback.id,
  };
}

async function getAuthIdentityImpl(): Promise<AuthIdentity | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  const email = typeof claimsData?.claims?.email === "string" ? claimsData.claims.email : null;

  if (claimsError || !userId) return null;
  return {
    userId,
    email,
    userMetadata: claimsData.claims.user_metadata,
  };
}

export const getAuthIdentity = cache(getAuthIdentityImpl);

async function getCurrentProfileImpl(): Promise<AppProfile | null> {
  if (!isSupabaseConfigured()) {
    return {
      id: demoStudent.userId,
      email: demoStudent.email,
      fullName: demoStudent.fullName,
      role: "student",
    };
  }

  const identity = await getAuthIdentity();
  if (!identity) return null;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", identity.userId)
    .maybeSingle();

  if (error || !data) {
    return getDemoProfileFallback(identity.email, identity.userId);
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
  };
}

export const getCurrentProfile = cache(getCurrentProfileImpl);

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
}

export async function requireStudentAccess() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "student" && profile.role !== "admin") redirect("/login");
  return profile;
}

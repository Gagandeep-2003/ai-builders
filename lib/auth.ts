import { redirect } from "next/navigation";
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
    fullName: "Bootcamp Admin",
    role: "admin",
  },
};

export type AppProfile = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
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

export async function getCurrentProfile(): Promise<AppProfile | null> {
  if (!isSupabaseConfigured()) {
    return {
      id: demoStudent.userId,
      email: demoStudent.email,
      fullName: demoStudent.fullName,
      role: "student",
    };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return getDemoProfileFallback(user.email, user.id);
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
  };
}

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

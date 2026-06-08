import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const entries = readFileSync(".env.local", "utf8")
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    });

  return Object.fromEntries(entries);
}

const env = loadEnv();
const supabaseKey =
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const cases = [
  {
    label: "student",
    email: "student@demo.com",
    password: "student1234",
    expectedRole: "student",
  },
  {
    label: "admin",
    email: "admin@bootcamp.com",
    password: "admin1234",
    expectedRole: "admin",
  },
];

const demoFallbackRoles = {
  "student@demo.com": "student",
  "admin@bootcamp.com": "admin",
};

if (!env.NEXT_PUBLIC_SUPABASE_URL || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  process.exit(1);
}

const results = [];

for (const item of cases) {
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey,
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email: item.email,
    password: item.password,
  });

  if (error) {
    results.push({
      label: item.label,
      email: item.email,
      auth: "failed",
      error: error.message,
    });
    continue;
  }

  const profileResult = await supabase
    .from("profiles")
    .select("role,email,full_name")
    .eq("id", data.user.id)
    .maybeSingle();

  await supabase.auth.signOut();

  results.push({
    label: item.label,
    email: item.email,
    auth: "ok",
    profile: profileResult.data ? "found" : "missing",
    role: profileResult.data?.role ?? null,
    expectedRole: item.expectedRole,
    roleMatches: profileResult.data?.role === item.expectedRole,
    appDemoFallbackRole: profileResult.data
      ? null
      : demoFallbackRoles[item.email.toLowerCase()] ?? null,
    profileError: profileResult.error
      ? {
          code: profileResult.error.code,
          message: profileResult.error.message,
        }
      : null,
  });
}

console.log(JSON.stringify(results, null, 2));

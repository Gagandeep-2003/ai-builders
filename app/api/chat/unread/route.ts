import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const profile = await getCurrentProfile();
  const supabase = await createServerSupabaseClient();
  if (!profile || !supabase) {
    return NextResponse.json({ count: 0, latest: "" });
  }

  if (profile.role === "admin") {
    const { count } = await supabase
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("sender_role", "student")
      .is("read_by_admin_at", null);

    const { data: latest } = await supabase
      .from("chat_messages")
      .select("body")
      .eq("sender_role", "student")
      .is("read_by_admin_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({ count: count ?? 0, latest: latest?.body ?? "New student message" });
  }

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!student?.id) return NextResponse.json({ count: 0, latest: "" });

  const { count } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("student_id", student.id)
    .eq("sender_role", "admin")
    .is("read_by_student_at", null);

  const { data: latest } = await supabase
    .from("chat_messages")
    .select("body")
    .eq("student_id", student.id)
    .eq("sender_role", "admin")
    .is("read_by_student_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ count: count ?? 0, latest: latest?.body ?? "New mentor message" });
}

import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const profile = await getCurrentProfile();
  const supabase = await createServerSupabaseClient();
  if (!profile || !supabase) {
    return NextResponse.json({ count: 0, latest: "", latestId: "", href: "/chat" });
  }

  if (profile.role === "admin") {
    const [{ count }, { data: latest }] = await Promise.all([
      supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("sender_role", "student")
        .is("read_by_admin_at", null),
      supabase
        .from("chat_messages")
        .select("id, student_id, body, kind, created_at")
        .eq("sender_role", "student")
        .is("read_by_admin_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    return NextResponse.json({
      count: count ?? 0,
      latest: latest?.body || (latest?.kind === "voice" ? "Sent a voice note." : "New student message"),
      latestId: latest?.id ?? "",
      createdAt: latest?.created_at ?? "",
      href: latest?.student_id
        ? `/admin/chat?student=${encodeURIComponent(latest.student_id)}`
        : "/admin/chat",
      title: "New student message",
      tag: latest?.student_id ? `chat-${latest.student_id}` : "ai-builders-chat",
    });
  }

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!student?.id) {
    return NextResponse.json({ count: 0, latest: "", latestId: "", href: "/chat" });
  }

  const [{ count }, { data: latest }] = await Promise.all([
    supabase
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("student_id", student.id)
      .eq("sender_role", "admin")
      .is("read_by_student_at", null),
    supabase
      .from("chat_messages")
      .select("id, body, kind, created_at")
      .eq("student_id", student.id)
      .eq("sender_role", "admin")
      .is("read_by_student_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    count: count ?? 0,
    latest: latest?.body || (latest?.kind === "voice" ? "Your mentor sent a voice note." : "New mentor message"),
    latestId: latest?.id ?? "",
    createdAt: latest?.created_at ?? "",
    href: "/chat",
    title: "New message from your mentor",
    tag: `chat-${student.id}`,
  });
}

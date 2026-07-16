import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { isWebPushConfigured } from "@/lib/push-notifications";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type SubscriptionBody = {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
};

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isWebPushConfigured()) {
    return NextResponse.json({ error: "Push notifications are not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as SubscriptionBody;
  const endpoint = body.endpoint?.trim();
  const p256dh = body.keys?.p256dh?.trim();
  const authKey = body.keys?.auth?.trim();
  if (!endpoint || !p256dh || !authKey) {
    return NextResponse.json({ error: "Invalid push subscription." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Notifications are unavailable." }, { status: 503 });

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: profile.id,
      endpoint,
      p256dh,
      auth_key: authKey,
      user_agent: request.headers.get("user-agent"),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  );

  if (error) return NextResponse.json({ error: "Subscription could not be saved." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as SubscriptionBody;
  const endpoint = body.endpoint?.trim();
  if (!endpoint) return NextResponse.json({ error: "Missing endpoint." }, { status: 400 });

  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Notifications are unavailable." }, { status: 503 });
  await supabase.from("push_subscriptions").delete().eq("user_id", profile.id).eq("endpoint", endpoint);
  return NextResponse.json({ ok: true });
}

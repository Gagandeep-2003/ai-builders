import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SignInRequest = {
  email?: unknown;
  deviceId?: unknown;
  deviceSecret?: unknown;
};

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function secretsMatch(storedHash: string, suppliedSecret: string) {
  const stored = Buffer.from(storedHash, "hex");
  const supplied = Buffer.from(hashSecret(suppliedSecret), "hex");
  return stored.length === supplied.length && timingSafeEqual(stored, supplied);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return json({ error: "Face Unlock request was rejected." }, 403);
    } catch {
      return json({ error: "Face Unlock request was rejected." }, 403);
    }
  }

  let input: SignInRequest;
  try {
    input = (await request.json()) as SignInRequest;
  } catch {
    return json({ error: "Face Unlock request is invalid." }, 400);
  }

  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const deviceId = typeof input.deviceId === "string" ? input.deviceId : "";
  const deviceSecret = typeof input.deviceSecret === "string" ? input.deviceSecret : "";

  if (
    !email.includes("@") ||
    !/^[0-9a-f-]{36}$/i.test(deviceId) ||
    !/^[0-9a-f]{64}$/i.test(deviceSecret)
  ) {
    return json({ error: "Face Unlock is not set up on this browser." }, 401);
  }

  const service = createServiceRoleSupabaseClient();
  if (!service) return json({ error: "Face Unlock is not configured on the server." }, 503);

  const { data: device, error: deviceError } = await service
    .from("face_unlock_devices")
    .select("id, user_id, login_email, secret_hash, failed_attempts, locked_until")
    .eq("device_id", deviceId)
    .eq("login_email", email)
    .is("revoked_at", null)
    .maybeSingle();

  if (deviceError) {
    return json(
      {
        error:
          deviceError.code === "42P01"
            ? "Face Unlock setup is not ready. Run the database migration."
            : "Face Unlock is temporarily unavailable.",
      },
      503,
    );
  }

  if (!device) return json({ error: "Face Unlock is not set up on this browser." }, 401);

  const lockedUntil = device.locked_until ? new Date(device.locked_until) : null;
  if (lockedUntil && lockedUntil.getTime() > Date.now()) {
    return json({ error: "Face Unlock is temporarily locked. Use your password or try again later." }, 429);
  }

  if (!secretsMatch(String(device.secret_hash), deviceSecret)) {
    const attempts = Number(device.failed_attempts || 0) + 1;
    const shouldLock = attempts >= 5;
    await service
      .from("face_unlock_devices")
      .update({
        failed_attempts: shouldLock ? 0 : attempts,
        locked_until: shouldLock ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", device.id);
    return json({ error: "Face Unlock could not verify this browser." }, 401);
  }

  const { data: profile, error: profileError } = await service
    .from("profiles")
    .select("role, email")
    .eq("id", device.user_id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "student") {
    return json({ error: "This account cannot use camera Face Unlock." }, 403);
  }

  const { data: link, error: linkError } = await service.auth.admin.generateLink({
    type: "magiclink",
    email: String(profile.email || email).trim().toLowerCase(),
  });

  if (linkError || !link?.properties?.hashed_token) {
    return json({ error: "Face Unlock could not create a portal session." }, 500);
  }

  await service
    .from("face_unlock_devices")
    .update({
      failed_attempts: 0,
      locked_until: null,
      last_used_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", device.id);

  return json({
    ok: true,
    tokenHash: link.properties.hashed_token,
    role: profile.role,
  });
}

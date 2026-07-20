"use server";

import { createHash } from "node:crypto";
import { getAuthIdentity } from "@/lib/auth";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type FaceUnlockActionResult = {
  ok: boolean;
  message: string;
};

type RegisterFaceUnlockInput = {
  deviceId: string;
  deviceSecret: string;
  deviceName: string;
};

function isValidDeviceId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isValidDeviceSecret(value: string) {
  return /^[0-9a-f]{64}$/i.test(value);
}

function hashDeviceSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function registerFaceUnlockDeviceAction(
  input: RegisterFaceUnlockInput,
): Promise<FaceUnlockActionResult> {
  const identity = await getAuthIdentity();
  if (!identity?.userId || !identity.email) {
    return { ok: false, message: "Please sign in again before setting up Face Unlock." };
  }

  if (
    !isValidDeviceId(input.deviceId) ||
    !isValidDeviceSecret(input.deviceSecret) ||
    !input.deviceName.trim()
  ) {
    return { ok: false, message: "This browser could not create a valid Face Unlock device." };
  }

  const service = createServiceRoleSupabaseClient();
  if (!service) {
    return {
      ok: false,
      message: "Face Unlock needs SUPABASE_SERVICE_ROLE_KEY before it can be enabled.",
    };
  }

  const { data: profile, error: profileError } = await service
    .from("profiles")
    .select("role, email")
    .eq("id", identity.userId)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "student") {
    return { ok: false, message: "Camera Face Unlock is currently available to student accounts only." };
  }

  const email = String(profile.email || identity.email).trim().toLowerCase();
  const { error } = await service.from("face_unlock_devices").upsert(
    {
      user_id: identity.userId,
      device_id: input.deviceId,
      login_email: email,
      secret_hash: hashDeviceSecret(input.deviceSecret),
      friendly_name: input.deviceName.trim().slice(0, 120),
      failed_attempts: 0,
      locked_until: null,
      revoked_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,device_id" },
  );

  if (error) {
    const migrationMissing = error.code === "42P01" || /face_unlock_devices/i.test(error.message);
    return {
      ok: false,
      message: migrationMissing
        ? "Run the Face Unlock beta migration in Supabase, then try again."
        : "Face Unlock could not register this browser. Please try again.",
    };
  }

  return { ok: true, message: "Camera Face Unlock is ready on this browser." };
}

export async function removeFaceUnlockDeviceAction(deviceId: string): Promise<FaceUnlockActionResult> {
  const identity = await getAuthIdentity();
  if (!identity?.userId) {
    return { ok: false, message: "Please sign in again before removing Face Unlock." };
  }
  if (!isValidDeviceId(deviceId)) {
    return { ok: false, message: "This Face Unlock device is invalid." };
  }

  const service = createServiceRoleSupabaseClient();
  if (!service) {
    return { ok: false, message: "Face Unlock server access is not configured." };
  }

  const { error } = await service
    .from("face_unlock_devices")
    .update({ revoked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("user_id", identity.userId)
    .eq("device_id", deviceId);

  return error
    ? { ok: false, message: "Face Unlock could not be removed. Please try again." }
    : { ok: true, message: "Camera Face Unlock removed from this browser." };
}

"use client";

type PasskeyErrorLike = {
  code?: string;
  message?: string;
  name?: string;
};

export function isPasskeySupported() {
  return Boolean(
    typeof window !== "undefined" &&
      window.isSecureContext &&
      "PublicKeyCredential" in window &&
      navigator.credentials,
  );
}

export async function hasPlatformAuthenticator() {
  if (!isPasskeySupported()) return false;

  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function getDeviceUnlockLabel() {
  if (typeof navigator === "undefined") return "Device passkey";

  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();

  if (platform.includes("win")) return "Windows Hello";
  if (platform.includes("mac")) return "Touch ID or device passkey";
  if (/iphone|ipad|ipod/.test(userAgent)) return "Face ID or Touch ID";
  if (userAgent.includes("android")) return "Android device unlock";
  return "Device passkey";
}

export function formatPasskeyError(error: unknown, action: "register" | "sign-in" | "manage") {
  const candidate = (error ?? {}) as PasskeyErrorLike;
  const code = candidate.code?.toLowerCase() ?? "";
  const message = candidate.message?.toLowerCase() ?? "";
  const name = candidate.name?.toLowerCase() ?? "";
  const detail = `${code} ${message} ${name}`;

  if (/aborted|notallowed|ceremony.*abort|cancel/.test(detail)) {
    return "Device verification was cancelled. Try again when you are ready.";
  }
  if (/invalid.*domain|invalid.*rp|relying party|rp id|origin/.test(detail)) {
    return "This website address is not authorized for passkeys yet. Ask the administrator to add this domain in Supabase Auth.";
  }
  if (/previously.*registered|already.*registered/.test(detail)) {
    return "This device passkey is already connected to your account.";
  }
  if (/experimental|passkey.*disabled|not enabled|feature.*disabled/.test(detail)) {
    return "Face ID sign-in is not enabled in Supabase Auth yet. The administrator must enable Passkeys first.";
  }
  if (/not supported|unsupported|webauthn.*unavailable/.test(detail)) {
    return "This browser or device does not support secure passkey sign-in.";
  }
  if (/credential.*not found|no.*credential|unknown credential/.test(detail)) {
    return "No matching device passkey was found. Use your password, then add this device from Profile.";
  }

  if (action === "register") return "This device could not be added. Check the browser prompt and try again.";
  if (action === "sign-in") return "Device sign-in did not complete. Try again or use your password.";
  return "The passkey change could not be saved. Please try again.";
}

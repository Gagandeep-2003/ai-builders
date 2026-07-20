"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, ScanFace } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  formatPasskeyError,
  getDeviceUnlockLabel,
  isPasskeySupported,
} from "@/lib/passkeys";

export function PasskeySignInButton() {
  const router = useRouter();
  const [supported, setSupported] = useState(true);
  const [deviceLabel, setDeviceLabel] = useState("Face ID / device passkey");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSupported(isPasskeySupported());
      setDeviceLabel(getDeviceUnlockLabel());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function signIn() {
    if (pending) return;

    setPending(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPasskey();
      if (signInError) throw signInError;
      if (!data.user) throw new Error("Passkey sign-in returned no user.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error("The signed-in account does not have a portal profile.");
      }

      router.replace(profile.role === "admin" ? "/admin" : "/dashboard");
      router.refresh();
    } catch (signInError) {
      setError(formatPasskeyError(signInError, "sign-in"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-5">
      <div className="mb-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <button
        type="button"
        onClick={signIn}
        disabled={!supported || pending}
        className="button-motion flex w-full items-center justify-center gap-2 rounded-xl border border-accent/35 bg-accent/8 px-5 py-3 font-bold text-accent disabled:cursor-not-allowed disabled:opacity-45"
      >
        {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ScanFace className="h-4 w-4" />}
        {pending ? "Checking this device..." : `Sign in with ${deviceLabel}`}
        <span className="rounded-md border border-accent/25 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider">
          Beta
        </span>
      </button>
      {!supported ? (
        <p className="mt-2 text-center text-xs text-text-muted">Passkeys require a supported browser and a secure connection.</p>
      ) : (
        <p className="mt-2 text-center text-xs text-text-muted">
          On iPhone, Safari uses Apple&apos;s native Face ID or Touch ID prompt.
        </p>
      )}
      {error ? (
        <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      ) : null}
    </div>
  );
}

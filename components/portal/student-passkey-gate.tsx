"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LoaderCircle, LockKeyhole, ScanFace, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  formatPasskeyError,
  getDeviceUnlockLabel,
  isPasskeyReopenLockEnabled,
  isPasskeySessionUnlocked,
  markPasskeySessionUnlocked,
  PASSKEY_PREFERENCE_EVENT,
} from "@/lib/passkeys";

type GateState = "checking" | "locked" | "unlocked";

export function StudentPasskeyGate({
  children,
  enabled,
  userId,
  studentName,
}: {
  children: ReactNode;
  enabled: boolean;
  userId: string;
  studentName: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<GateState>(enabled ? "checking" : "unlocked");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const checkLock = () => {
      const shouldLock = isPasskeyReopenLockEnabled(userId) && !isPasskeySessionUnlocked(userId);
      setState(shouldLock ? "locked" : "unlocked");
    };

    const frame = window.requestAnimationFrame(checkLock);
    window.addEventListener(PASSKEY_PREFERENCE_EVENT, checkLock);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(PASSKEY_PREFERENCE_EVENT, checkLock);
    };
  }, [enabled, userId]);

  async function unlock() {
    if (working) return;
    setWorking(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPasskey();
      if (signInError) throw signInError;
      if (!data.user || data.user.id !== userId) {
        await supabase.auth.signOut();
        router.replace("/login");
        throw new Error("The selected passkey belongs to another account.");
      }

      markPasskeySessionUnlocked(userId);
      setState("unlocked");
      router.refresh();
    } catch (signInError) {
      setError(formatPasskeyError(signInError, "sign-in"));
    } finally {
      setWorking(false);
    }
  }

  async function usePassword() {
    setWorking(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (state === "unlocked") return children;

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-bg-base px-4 py-12">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px] opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(110,231,183,0.13),transparent_24rem)]" />
      <section className="premium-card relative z-10 w-full max-w-md rounded-xl p-6 text-center shadow-[0_28px_90px_rgba(0,0,0,0.42)] sm:p-8">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-accent/35 bg-accent/10 text-accent shadow-[0_0_36px_rgba(110,231,183,0.12)]">
          {state === "checking" ? <LoaderCircle className="h-6 w-6 animate-spin" /> : <ScanFace className="h-7 w-7" />}
        </div>
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Student privacy lock · Beta</p>
        <h1 className="mt-3 font-heading text-2xl font-bold">
          {state === "checking" ? "Securing your workspace" : `Welcome back, ${studentName.split(" ")[0]}`}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-text-secondary">
          {state === "checking"
            ? "Checking this browser session."
            : `Verify with ${getDeviceUnlockLabel()} to reopen your student portal.`}
        </p>

        {state === "locked" ? (
          <div className="mt-7 space-y-3">
            <button
              type="button"
              onClick={unlock}
              disabled={working}
              className="button-motion flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 font-bold text-bg-base disabled:cursor-not-allowed disabled:opacity-50"
            >
              {working ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {working ? "Waiting for device..." : "Unlock student portal"}
            </button>
            <button
              type="button"
              onClick={usePassword}
              disabled={working}
              className="button-motion flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-bg-elevated px-5 py-3 text-sm font-bold text-text-secondary disabled:opacity-50"
            >
              <LockKeyhole className="h-4 w-4" /> Use password instead
            </button>
          </div>
        ) : null}

        {error ? <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-left text-sm text-rose-200">{error}</p> : null}
        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-text-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Biometric data never leaves this device
        </p>
      </section>
    </main>
  );
}

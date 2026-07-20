"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  KeyRound,
  Laptop,
  LoaderCircle,
  ScanFace,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  formatPasskeyError,
  getDeviceUnlockLabel,
  hasPlatformAuthenticator,
  isPasskeySupported,
} from "@/lib/passkeys";

type PasskeyRecord = {
  id: string;
  friendly_name?: string;
  created_at: string;
  last_used_at?: string;
};

function formatPasskeyDate(value?: string) {
  if (!value) return "Not used yet";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function PasskeyBetaPanel({ studentName }: { studentName: string }) {
  const [supported, setSupported] = useState(true);
  const [platformAvailable, setPlatformAvailable] = useState<boolean | null>(null);
  const [deviceLabel, setDeviceLabel] = useState("Device passkey");
  const [passkeys, setPasskeys] = useState<PasskeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPasskeys = useCallback(async () => {
    const supabase = createClient();
    const { data, error: listError } = await supabase.auth.passkey.list();
    if (listError) throw listError;
    setPasskeys(data ?? []);
    return data ?? [];
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const browserSupported = isPasskeySupported();
      if (!active) return;
      setSupported(browserSupported);
      setDeviceLabel(getDeviceUnlockLabel());

      if (!browserSupported) {
        setPlatformAvailable(false);
        setLoading(false);
        return;
      }

      try {
        const [available] = await Promise.all([
          hasPlatformAuthenticator(),
          loadPasskeys(),
        ]);
        if (active) setPlatformAvailable(available);
      } catch (loadError) {
        if (active) setError(formatPasskeyError(loadError, "manage"));
      } finally {
        if (active) setLoading(false);
      }
    }

    void initialize();
    return () => {
      active = false;
    };
  }, [loadPasskeys]);

  async function addThisDevice() {
    if (working) return;
    setWorking(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const { data, error: registerError } = await supabase.auth.registerPasskey();
      if (registerError) throw registerError;
      if (!data?.id) throw new Error("Passkey registration returned no credential.");

      const friendlyName = `${studentName} · ${deviceLabel}`.slice(0, 120);
      const { error: renameError } = await supabase.auth.passkey.update({
        passkeyId: data.id,
        friendlyName,
      });
      if (renameError) throw renameError;

      await loadPasskeys();
      setMessage(`This device is ready. When you are signed out, choose “Sign in with ${deviceLabel}” on the login page.`);
    } catch (registerError) {
      setError(formatPasskeyError(registerError, "register"));
    } finally {
      setWorking(false);
    }
  }

  async function removePasskey(passkey: PasskeyRecord) {
    const confirmed = window.confirm(
      `Remove ${passkey.friendly_name || "this device passkey"}? You will need your password on this device.`,
    );
    if (!confirmed || working) return;

    setWorking(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase.auth.passkey.delete({ passkeyId: passkey.id });
      if (deleteError) throw deleteError;
      await loadPasskeys();
      setMessage("Device passkey removed.");
    } catch (deleteError) {
      setError(formatPasskeyError(deleteError, "manage"));
    } finally {
      setWorking(false);
    }
  }

  const canRegister = supported && platformAvailable === true;

  return (
    <section className="premium-card mt-5 overflow-hidden rounded-xl">
      <div className="grid gap-6 border-b border-border p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
            <ScanFace className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-xl font-bold">Native device passkey</h2>
              <span className="rounded-md border border-accent/25 bg-accent/8 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-accent">
                Beta
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Add a secure passkey once, then use Apple Face ID, Touch ID, Windows Hello, a device PIN, or your screen lock whenever you are signed out. Authentication stays inside the device.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={addThisDevice}
          disabled={!canRegister || working || loading}
          className="button-motion inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-bold text-bg-base disabled:cursor-not-allowed disabled:opacity-45"
        >
          {working ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          {working ? "Waiting for device..." : "Add this device"}
        </button>
      </div>

      <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)]">
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">Connected devices</p>
            <span className="text-xs text-text-muted">{passkeys.length} connected</span>
          </div>

          {loading ? (
            <div className="mt-3 flex min-h-20 items-center justify-center rounded-lg border border-border bg-bg-elevated/65 text-text-muted">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Checking device support
            </div>
          ) : passkeys.length ? (
            <div className="mt-3 space-y-2">
              {passkeys.map((passkey) => (
                <div key={passkey.id} className="flex items-center gap-3 rounded-lg border border-border bg-bg-elevated/65 p-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-accent">
                    <Laptop className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-text-primary">{passkey.friendly_name || "Device passkey"}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      Added {formatPasskeyDate(passkey.created_at)} · Last used {formatPasskeyDate(passkey.last_used_at)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePasskey(passkey)}
                    disabled={working}
                    title="Remove device passkey"
                    aria-label={`Remove ${passkey.friendly_name || "device passkey"}`}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-danger/25 text-rose-300 transition hover:bg-danger/10 disabled:opacity-45"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-border p-4 text-sm text-text-secondary">
              No device passkey connected yet.
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-bg-elevated/65 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="font-heading font-bold">How sign-in works</p>
              <p className="mt-1 text-sm leading-5 text-text-secondary">
                Students who are already signed in continue directly into the portal. Native device authentication is requested only from the login screen after logout or session expiry.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-bg-card p-3 text-sm leading-6 text-text-secondary">
            This is the strongest passwordless option. The operating system verifies you, and the portal never receives biometric data.
          </div>
          {!supported ? (
            <p className="mt-3 text-xs text-rose-300">This browser does not support secure passkeys.</p>
          ) : platformAvailable === false ? (
            <p className="mt-3 text-xs text-amber-300">No built-in device authenticator is available in this browser.</p>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-xs text-text-muted">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> {deviceLabel} available
            </p>
          )}
        </div>
      </div>

      {message ? <p className="mx-6 mb-6 rounded-lg border border-accent/25 bg-accent/8 px-3 py-2 text-sm text-accent">{message}</p> : null}
      {error ? <p className="mx-6 mb-6 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-rose-200">{error}</p> : null}
    </section>
  );
}

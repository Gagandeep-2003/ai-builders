"use client";

import { useActionState } from "react";
import {
  changeApprovedPasswordAction,
  requestPasswordChangeAction,
} from "@/app/actions/profile";
import { StatusBadge } from "@/components/ui/status-badge";
import type { PasswordChangeRequest } from "@/lib/course-data";
import { formatDate } from "@/lib/utils";

type PasswordChangePanelProps = {
  latestPasswordRequest?: PasswordChangeRequest;
  approvedRequest?: PasswordChangeRequest;
  hasOpenRequest: boolean;
};

function ActionMessage({ ok, message }: { ok: boolean; message: string }) {
  if (!message) return null;

  return (
    <div
      className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
        ok
          ? "border-accent/30 bg-accent/10 text-accent"
          : "border-rose-400/35 bg-rose-500/10 text-rose-100"
      }`}
    >
      {message}
    </div>
  );
}

export function PasswordChangePanel({
  latestPasswordRequest,
  approvedRequest,
  hasOpenRequest,
}: PasswordChangePanelProps) {
  const [requestState, requestAction, isRequestPending] = useActionState(
    requestPasswordChangeAction,
    { ok: false, message: "" },
  );
  const [passwordState, passwordAction, isPasswordPending] = useActionState(
    changeApprovedPasswordAction,
    { ok: false, message: "" },
  );

  return (
    <section className="premium-card rounded-xl p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-accent">Security</p>
          <h2 className="mt-2 font-heading text-2xl font-bold">Password change</h2>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            Password changes require admin approval. Submit a request here; once approved,
            this page will unlock the password update form.
          </p>
        </div>
        {latestPasswordRequest ? <StatusBadge status={latestPasswordRequest.status} /> : null}
      </div>

      {approvedRequest ? (
        <>
          <ActionMessage ok={passwordState.ok} message={passwordState.message} />
          <form action={passwordAction} className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              name="password"
              type="password"
              minLength={8}
              placeholder="New password"
              className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
            />
            <input
              name="confirmPassword"
              type="password"
              minLength={8}
              placeholder="Confirm password"
              className="rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
            />
            <button
              className="button-motion rounded-xl bg-accent px-5 py-3 font-bold text-bg-base disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
              disabled={isPasswordPending}
            >
              {isPasswordPending ? "Updating..." : "Update Password"}
            </button>
          </form>
        </>
      ) : hasOpenRequest ? (
        <div className="mt-6 rounded-xl border border-border/70 bg-white/[0.025] p-4">
          <p className="font-heading font-bold">
            {latestPasswordRequest?.status === "pending"
              ? "Your request is waiting for admin approval."
              : "Your request has already been reviewed."}
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Requested {latestPasswordRequest ? formatDate(latestPasswordRequest.requestedAt) : "recently"}.
          </p>
        </div>
      ) : (
        <>
          <ActionMessage ok={requestState.ok} message={requestState.message} />
          <form action={requestAction} className="mt-6 space-y-4">
            <textarea
              name="reason"
              placeholder="Reason for password change request"
              className="min-h-28 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm"
            />
            <button
              className="button-motion rounded-xl bg-accent px-5 py-3 font-bold text-bg-base disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isRequestPending}
            >
              {isRequestPending ? "Sending..." : "Request Password Change"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}

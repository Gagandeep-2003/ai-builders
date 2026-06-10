"use client";

import { useActionState } from "react";
import { updateStudentContactAction } from "@/app/actions/profile";

type ProfileContactFormProps = {
  parentName: string;
  parentEmail: string;
  country: string;
};

export function ProfileContactForm({
  parentName,
  parentEmail,
  country,
}: ProfileContactFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateStudentContactAction,
    { ok: false, message: "" },
  );

  return (
    <form action={formAction} className="premium-card rounded-xl p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase text-accent">Editable contact</p>
          <h2 className="mt-2 font-heading text-2xl font-bold">Parent and country details</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            You can update these fields yourself. Enrollment, batch, email, and timezone remain managed by admin.
          </p>
        </div>
        <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 font-mono text-[11px] uppercase text-accent">
          3 editable fields
        </span>
      </div>

      {state.message ? (
        <div
          className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
            state.ok
              ? "border-accent/30 bg-accent/10 text-accent"
              : "border-rose-400/35 bg-rose-500/10 text-rose-100"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="font-mono text-xs uppercase text-text-muted">Parent</span>
          <input
            name="parentName"
            defaultValue={parentName}
            required
            className="mt-2 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm outline-none transition focus:border-accent/60"
          />
        </label>
        <label>
          <span className="font-mono text-xs uppercase text-text-muted">Parent Email</span>
          <input
            name="parentEmail"
            type="email"
            defaultValue={parentEmail}
            required
            className="mt-2 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm outline-none transition focus:border-accent/60"
          />
        </label>
        <label>
          <span className="font-mono text-xs uppercase text-text-muted">Country</span>
          <input
            name="country"
            defaultValue={country}
            required
            className="mt-2 w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm outline-none transition focus:border-accent/60"
          />
        </label>
      </div>

      <button
        className="button-motion mt-6 rounded-xl bg-accent px-5 py-3 font-bold text-bg-base disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
      >
        {isPending ? "Saving..." : "Save Profile Details"}
      </button>
    </form>
  );
}

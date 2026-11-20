"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createDemoRequestAction,
  type DemoRequestActionState,
} from "@/app/actions/demo-request";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: DemoRequestActionState = {
  ok: false,
  message: "",
};

const inputClassName =
  "mt-2 w-full rounded-md border border-border bg-bg-base px-3.5 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent/60 focus:ring-2 focus:ring-accent/15";

export function DemoRequestForm() {
  const [state, action] = useActionState(createDemoRequestAction, initialState);
  const timeZoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (timeZoneInputRef.current) {
      timeZoneInputRef.current.value =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    }
  }, []);

  if (state.ok) {
    return (
      <div className="rounded-lg border border-accent/35 bg-accent/[0.08] p-6" role="status">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-accent">
          Request received
        </p>
        <h2 className="mt-3 font-heading text-2xl font-bold">We will be in touch.</h2>
        <p className="mt-3 max-w-xl leading-7 text-text-secondary">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-5" noValidate>
      <input
        ref={timeZoneInputRef}
        type="hidden"
        name="timeZone"
        defaultValue="UTC"
      />
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Parent or guardian name
          <input
            className={inputClassName}
            name="parentName"
            autoComplete="name"
            required
            maxLength={120}
          />
        </label>
        <label className="text-sm font-semibold">
          Student name
          <input
            className={inputClassName}
            name="studentName"
            autoComplete="off"
            required
            maxLength={120}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
        <label className="text-sm font-semibold">
          Parent email
          <input
            className={inputClassName}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            maxLength={180}
          />
        </label>
        <label className="text-sm font-semibold">
          Student age
          <input
            className={inputClassName}
            type="number"
            name="studentAge"
            min={6}
            max={21}
            inputMode="numeric"
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Country
          <input
            className={inputClassName}
            name="country"
            autoComplete="country-name"
            required
            maxLength={100}
          />
        </label>
        <label className="text-sm font-semibold">
          Phone or WhatsApp <span className="font-normal text-text-muted">(optional)</span>
          <input
            className={inputClassName}
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            maxLength={40}
          />
        </label>
      </div>

      <label className="text-sm font-semibold">
        What would you like the student to learn or build?
        <textarea
          className={`${inputClassName} min-h-32 resize-y`}
          name="goals"
          required
          maxLength={1500}
          placeholder="For example: understand AI safely, build an app, improve school workflows, or explore coding."
        />
      </label>

      <label className="text-sm font-semibold">
        Preferred days and times
        <textarea
          className={`${inputClassName} min-h-24 resize-y`}
          name="preferredSchedule"
          required
          maxLength={500}
          placeholder="Share two or three suitable options in your local time."
        />
        <span className="mt-2 block text-xs font-normal text-text-muted">
          We save your browser&apos;s local time zone automatically.
        </span>
      </label>

      {state.message ? (
        <p
          className="rounded-md border border-danger/35 bg-danger/10 px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <SubmitButton
        pendingLabel="Sending request..."
        className="min-h-12 rounded-md bg-accent px-5 py-3 font-bold text-[#07110d] hover:brightness-105"
      >
        Request a free demo
      </SubmitButton>
      <p className="text-center text-xs leading-5 text-text-muted">
        No automatic booking and no payment. We will contact you personally to confirm a suitable time.
      </p>
    </form>
  );
}

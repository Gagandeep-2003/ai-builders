"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { PasskeySignInButton } from "@/components/auth/passkey-sign-in-button";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <motion.div
      animate={state.error ? { x: [0, -7, 7, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.32 }}
      className="premium-card mx-auto w-full max-w-md rounded-xl p-6 shadow-[0_26px_90px_rgba(0,0,0,0.36)] sm:p-7"
    >
      <div className="grid h-12 w-12 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <h1 className="mt-6 font-heading text-3xl font-bold">Sign in</h1>
      <p className="mt-3 leading-6 text-text-secondary">
        Continue to your AI Builders workspace, coursework, and class dashboard.
      </p>

      <form action={action} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm text-text-secondary">Email</span>
          <span className="flex items-center gap-3 rounded-xl border border-border bg-bg-elevated px-3 py-3 focus-within:border-accent/55">
            <Mail className="h-4 w-4 text-text-muted" />
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </span>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-text-secondary">Password</span>
          <span className="flex items-center gap-3 rounded-xl border border-border bg-bg-elevated px-3 py-3 focus-within:border-accent/55">
            <LockKeyhole className="h-4 w-4 text-text-muted" />
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </span>
        </label>

        {state.error ? (
          <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-rose-200">
            {state.error}
          </p>
        ) : null}

        <button
          disabled={pending}
          className="button-motion w-full rounded-xl bg-accent px-5 py-3 font-bold text-bg-base shadow-[0_18px_44px_rgba(110,231,183,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <PasskeySignInButton />

      <div className="mt-6 flex items-center justify-between gap-4 text-sm">
        <a href="mailto:hello@aibuilders.example?subject=Password%20reset" className="text-text-secondary hover:text-accent">
          Forgot password?
        </a>
        <span className="text-xs text-text-muted">Secure portal access</span>
      </div>
    </motion.div>
  );
}

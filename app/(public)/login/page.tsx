import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(135deg,rgba(10,10,15,0.96),rgba(17,24,39,0.92)_48%,rgba(18,18,24,0.98))]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute left-0 top-0 -z-10 h-full w-full bg-[radial-gradient(circle_at_18%_18%,rgba(110,231,183,0.16),transparent_22rem),radial-gradient(circle_at_86%_78%,rgba(245,158,11,0.12),transparent_24rem),linear-gradient(180deg,rgba(96,165,250,0.08),transparent_46%)]" />

      <section className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,430px)]">
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          <Link href="/" className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
            AI Builders Academy
          </Link>
          <h2 className="mt-6 font-heading text-4xl font-bold leading-tight text-text-primary sm:text-5xl">
            Build, submit, and track your AI learning work.
          </h2>
          <p className="mt-5 text-base leading-7 text-text-secondary sm:text-lg">
            Access coursework, class links, submissions, progress, and resources from one focused student portal.
          </p>
          <div className="mt-8 grid gap-3 text-left text-sm text-text-secondary sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <span className="block font-heading text-lg font-bold text-text-primary">Live</span>
              Class dashboard
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <span className="block font-heading text-lg font-bold text-text-primary">96</span>
              Coursework tasks
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <span className="block font-heading text-lg font-bold text-text-primary">3</span>
              AI modules
            </div>
          </div>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}

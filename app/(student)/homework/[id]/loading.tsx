import { ArrowLeft, FileText, Timer } from "lucide-react";

export default function HomeworkDetailLoading() {
  return (
    <main className="space-y-8" aria-label="Opening task">
      <div className="inline-flex items-center gap-2 text-sm text-text-secondary">
        <ArrowLeft className="h-4 w-4" />
        Back to homework
      </div>
      <header>
        <p className="font-mono text-xs uppercase text-accent">Task workspace</p>
        <div className="mt-3 h-10 w-full max-w-md animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-white/[0.04]" />
      </header>
      <section className="grid gap-4 lg:grid-cols-4">
        {[Timer, FileText, FileText, Timer].map((Icon, index) => (
          <div key={index} className="premium-card min-h-28 rounded-xl p-5">
            <Icon className="h-4 w-4 text-accent/70" />
            <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-white/[0.05]" />
          </div>
        ))}
      </section>
      <section className="premium-card min-h-64 rounded-xl p-6">
        <div className="h-4 w-28 animate-pulse rounded bg-accent/10" />
        <div className="mt-5 space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-white/[0.05]" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-white/[0.04]" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-white/[0.04]" />
        </div>
      </section>
    </main>
  );
}

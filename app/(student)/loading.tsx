export default function StudentRouteLoading() {
  return (
    <main className="space-y-8 py-2" aria-label="Opening page">
      <header>
        <div className="h-3 w-44 animate-pulse rounded bg-accent/10" />
        <div className="mt-4 h-10 w-full max-w-sm animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-white/[0.04]" />
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="premium-card min-h-32 rounded-xl p-5">
            <div className="h-4 w-24 animate-pulse rounded bg-accent/10" />
            <div className="mt-5 h-6 w-2/3 animate-pulse rounded bg-white/[0.05]" />
          </div>
        ))}
      </section>
    </main>
  );
}

export default function AdminRouteLoading() {
  return (
    <main className="space-y-8 py-2" aria-label="Opening admin view">
      <header>
        <div className="h-3 w-36 animate-pulse rounded bg-accent/10" />
        <div className="mt-4 h-10 w-full max-w-md animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-white/[0.04]" />
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="premium-card min-h-32 rounded-xl p-5">
            <div className="h-4 w-28 animate-pulse rounded bg-accent/10" />
            <div className="mt-5 h-8 w-16 animate-pulse rounded bg-white/[0.06]" />
            <div className="mt-4 h-3 w-2/3 animate-pulse rounded bg-white/[0.04]" />
          </div>
        ))}
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        {[0, 1].map((item) => (
          <div key={item} className="premium-card min-h-64 rounded-xl p-6">
            <div className="h-5 w-44 animate-pulse rounded bg-white/[0.06]" />
            <div className="mt-6 space-y-3">
              {[0, 1, 2].map((row) => (
                <div key={row} className="h-12 animate-pulse rounded-lg bg-white/[0.035]" />
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

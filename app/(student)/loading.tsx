export default function StudentLoading() {
  return (
    <main className="space-y-6">
      <div className="h-4 w-44 animate-pulse rounded-full bg-accent/20" />
      <div className="space-y-3">
        <div className="h-10 w-72 max-w-full animate-pulse rounded-xl bg-white/10" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="premium-card h-36 animate-pulse rounded-xl" />
        ))}
      </div>
      <div className="premium-card h-80 animate-pulse rounded-xl" />
    </main>
  );
}

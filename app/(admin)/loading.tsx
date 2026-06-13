export default function AdminLoading() {
  return (
    <main className="space-y-6">
      <div className="h-4 w-40 animate-pulse rounded-full bg-accent/20" />
      <div className="space-y-3">
        <div className="h-10 w-80 max-w-full animate-pulse rounded-xl bg-white/10" />
        <div className="h-4 w-[28rem] max-w-full animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="premium-card h-28 animate-pulse rounded-xl" />
        ))}
      </div>
      <div className="premium-card h-96 animate-pulse rounded-xl" />
    </main>
  );
}

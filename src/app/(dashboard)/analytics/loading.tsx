export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-4 lg:p-6 animate-pulse">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white/5 p-4 h-24" />
        ))}
      </div>
      <div className="rounded-xl bg-white/5 h-64" />
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <div className="rounded-xl bg-white/5 h-48" />
        <div className="rounded-xl bg-white/5 h-48" />
      </div>
    </div>
  );
}

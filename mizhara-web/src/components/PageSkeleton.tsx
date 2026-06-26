export default function PageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden="true">
      <div className="space-y-2">
        <div className="h-8 w-44 rounded-lg bg-white/80"  />
        <div className="h-3 w-64 rounded bg-white/60"  />
      </div>
      <div className="bg-white border border-border-custom rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center gap-4">
          <div className="h-5 w-36 rounded bg-accent-pink/20"  />
          <div className="h-9 w-48 rounded-xl bg-accent-pink/15"  />
        </div>
        <div className="space-y-3 pt-2">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-accent-mint/30"  />
          ))}
        </div>
      </div>
    </div>
  );
}

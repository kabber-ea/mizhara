import { KpiCardGrid } from "@/components/KpiCard";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-9 w-48 animate-pulse rounded-lg bg-accent-pink/60" />
        <div className="mt-2 h-3 w-72 animate-pulse rounded bg-accent-pink/30" />
      </div>
      <KpiCardGrid count={4} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:auto-rows-fr">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="min-h-[280px] animate-pulse rounded-2xl border border-border-custom/60 bg-white" />
        ))}
      </div>
    </div>
  );
}

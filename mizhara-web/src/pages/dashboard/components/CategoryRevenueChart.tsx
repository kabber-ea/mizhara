import ChartCard from "@/components/ChartCard";
import { formatINR } from "@/utils/format";
import { categoryColor } from "@/utils/chartUtils";
import { DASHBOARD_CONTENT_HEIGHT } from "@/pages/dashboard/constants";
import type { CategorySales } from "@/types/dashboard";

function CategoryRevenueBarChart({ data }: { data: CategorySales[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center" style={{ height: DASHBOARD_CONTENT_HEIGHT }}>
        <p className="text-[11px] text-muted-custom">No category data yet</p>
      </div>
    );
  }

  const items = [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  const total = items.reduce((sum, item) => sum + item.revenue, 0);
  const maxRevenue = items[0]?.revenue ?? 1;

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: DASHBOARD_CONTENT_HEIGHT }}>
      <div className="mb-3 flex shrink-0 items-center justify-between border-b border-border-custom/40 pb-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-custom">Category</p>
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-custom">Revenue share</p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        {items.map((item, i) => {
          const pct = total > 0 ? Math.round((item.revenue / total) * 100) : 0;
          const width = Math.max(6, (item.revenue / maxRevenue) * 100);
          const color = categoryColor(i);

          return (
            <div
              key={item.category}
              className="group flex min-h-0 flex-1 flex-col justify-center gap-1.5 border-b border-border-custom/25 py-1 last:border-0"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold tabular-nums text-primary-dark ring-1 ring-white"
                    style={{ backgroundColor: `${color}22`, color }}
                  >
                    {i + 1}
                  </span>
                  <p className="truncate text-[11px] font-semibold text-primary-dark">{item.category}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-serif text-[11px] font-semibold tabular-nums text-primary-dark">{formatINR(item.revenue)}</p>
                  <p className="text-[9px] tabular-nums text-muted-custom">{pct}%</p>
                </div>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-gradient-to-r from-accent-pink/60 to-accent-pink/30">
                <div
                  className="absolute inset-y-0 left-0 rounded-full shadow-sm transition-all duration-700 ease-out group-hover:brightness-105"
                  style={{
                    width: `${width}%`,
                    background: `linear-gradient(90deg, ${color}bb 0%, ${color} 55%, ${color}dd 100%)`,
                    boxShadow: `0 1px 8px ${color}44`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CategoryRevenueChart({ data }: { data: CategorySales[] }) {
  return (
    <ChartCard title="Top Categories" subtitle="Revenue share by category">
      <CategoryRevenueBarChart data={data} />
    </ChartCard>
  );
}

import { formatINR } from "@/utils/format";
import ChartCard from "@/components/ChartCard";
import { categoryColor } from "@/utils/chartUtils";
import type { CategorySales } from "../types";

function CategoryRevenueLeaderboard({ data }: { data: CategorySales[] }) {
  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center">
        <p className="text-[11px] text-muted-custom">No category data yet</p>
      </div>
    );
  }

  const items = data.slice(0, 5);
  const maxRevenue = items[0]?.revenue ?? 1;

  return (
    <div className="flex h-[280px] flex-col">
      <div className="mb-2 grid shrink-0 grid-cols-[1fr_2.5rem_4.5rem] gap-2 pr-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-muted-custom">
        <span>Category</span>
        <span className="text-right">Sold</span>
        <span className="text-right">Revenue</span>
      </div>
      <div className="flex flex-1 flex-col justify-evenly">
        {items.map((item, i) => (
          <div key={item.category} className="group">
            <div className="grid grid-cols-[1fr_2.5rem_4.5rem] items-center gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full ring-2 ring-white"
                  style={{ backgroundColor: categoryColor(i) }}
                />
                <p className="truncate text-[11px] font-semibold text-primary-dark">{item.category}</p>
              </div>
              <p className="text-right text-[11px] font-bold tabular-nums text-primary-dark">{item.units}</p>
              <p className="text-right text-[10px] font-semibold tabular-nums text-muted-custom">{formatINR(item.revenue)}</p>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-accent-pink/70">
              <div
                className="h-full rounded-full transition-all duration-500 group-hover:opacity-90"
                style={{ width: `${Math.max(8, (item.revenue / maxRevenue) * 100)}%`, backgroundColor: categoryColor(i) }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CategoryRevenueChart({ data }: { data: CategorySales[] }) {
  return (
    <ChartCard title="Top Categories" subtitle="Revenue share by category">
      <CategoryRevenueLeaderboard data={data} />
    </ChartCard>
  );
}

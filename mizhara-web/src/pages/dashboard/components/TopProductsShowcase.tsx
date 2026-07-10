import { formatINR } from "@/utils/format";
import ChartCard from "@/components/ChartCard";
import { categoryColor } from "@/utils/chartUtils";
import { DASHBOARD_PANEL_MIN_HEIGHT } from "@/constants/dashboard";
import type { ProductSales } from "@/types/dashboard";

function BestSellingLeaderboard({ data }: { data: ProductSales[] }) {
  if (!data.length) {
    return (
      <div
        className="flex flex-1 items-center justify-center"
        style={{ minHeight: DASHBOARD_PANEL_MIN_HEIGHT }}
      >
        <p className="text-[11px] text-muted-custom">No sales data yet</p>
      </div>
    );
  }

  const items = data.slice(0, 5);
  const maxUnits = items[0]?.units ?? 1;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col" style={{ minHeight: DASHBOARD_PANEL_MIN_HEIGHT }}>
      <div className="mb-2 grid shrink-0 grid-cols-[1fr_2.5rem_4.5rem] gap-2 pr-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-muted-custom">
        <span>Product</span>
        <span className="text-right">Sold</span>
        <span className="text-right">Revenue</span>
      </div>
      <div
        className="grid min-h-0 flex-1 gap-2"
        style={{ gridTemplateRows: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item, i) => (
          <div key={item.productId} className="group flex h-full min-h-0 flex-col justify-center border-b border-border-custom/30 pb-2 last:border-0 last:pb-0">
            <div className="grid grid-cols-[1fr_2.5rem_4.5rem] items-center gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full ring-2 ring-white"
                  style={{ backgroundColor: categoryColor(i) }}
                />
                <p className="truncate text-[11px] font-semibold text-primary-dark">{item.name}</p>
              </div>
              <p className="text-right text-[11px] font-bold tabular-nums text-primary-dark">{item.units}</p>
              <p className="text-right text-[10px] font-semibold tabular-nums text-muted-custom">{formatINR(item.revenue)}</p>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-accent-pink/70">
              <div
                className="h-full rounded-full transition-all duration-500 group-hover:opacity-90"
                style={{
                  width: `${Math.max(8, (item.units / maxUnits) * 100)}%`,
                  backgroundColor: categoryColor(i),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TopProductsShowcase({ data }: { data: ProductSales[] }) {
  return (
    <ChartCard title="Best Selling" subtitle="Lifetime best sellers">
      <BestSellingLeaderboard data={data} />
    </ChartCard>
  );
}

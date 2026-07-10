import { formatINR } from "@/utils/format";
import ChartCard from "@/components/ChartCard";
import { DASHBOARD_CONTENT_HEIGHT } from "@/pages/dashboard/constants";
import type { ProductSales } from "@/types/dashboard";

function TrendingLeaderboardContent({ data }: { data: ProductSales[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center" style={{ height: DASHBOARD_CONTENT_HEIGHT }}>
        <p className="text-[11px] text-muted-custom">No sales data yet</p>
      </div>
    );
  }

  const items = data.slice(0, 5);
  const maxUnits = items[0]?.units ?? 1;

  return (
    <div className="flex flex-col" style={{ height: DASHBOARD_CONTENT_HEIGHT }}>
      <div className="mb-2 grid shrink-0 grid-cols-[1fr_2.5rem_4.5rem] gap-2 pl-7 pr-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-muted-custom">
        <span>Product</span>
        <span className="text-right">Sold</span>
        <span className="text-right">Revenue</span>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={item.productId} className="group border-b border-border-custom/30 pb-3 last:border-0 last:pb-0">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-pink/80 text-[9px] font-bold tabular-nums text-primary-dark ring-1 ring-border-custom/50">
                {i + 1}
              </span>
              <div className="grid min-w-0 flex-1 grid-cols-[1fr_2.5rem_4.5rem] items-center gap-2">
                <p className="truncate text-[11px] font-semibold text-primary-dark">{item.name}</p>
                <p className="text-right text-[11px] font-bold tabular-nums text-primary-dark">{item.units}</p>
                <p className="text-right text-[10px] font-semibold tabular-nums text-muted-custom">{formatINR(item.revenue)}</p>
              </div>
            </div>
            <div className="ml-7 mt-1 h-1 overflow-hidden rounded-full bg-accent-pink/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#5c9e7a] to-[#9ab89f] transition-all duration-700 ease-out group-hover:from-[#4d8f6a] group-hover:to-[#7ba38c]"
                style={{ width: `${Math.max(8, (item.units / maxUnits) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TrendingLeaderboard({ data }: { data: ProductSales[] }) {
  return (
    <ChartCard title="Trending" subtitle="Best sellers in the last 30 days">
      <TrendingLeaderboardContent data={data} />
    </ChartCard>
  );
}

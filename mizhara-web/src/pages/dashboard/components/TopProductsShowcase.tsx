import { formatINR } from "@/utils/format";
import ChartCard from "@/components/ChartCard";
import { DASHBOARD_CONTENT_HEIGHT } from "@/pages/dashboard/constants";
import type { ProductSales } from "@/types/dashboard";

const LIST_SLOTS = 5;

function TopProductsShowcaseContent({ data }: { data: ProductSales[] }) {
  const items = data.slice(0, LIST_SLOTS);
  const maxUnits = items[0]?.units ?? 1;

  if (!items.length) {
    return (
      <div className="flex items-center justify-center" style={{ height: DASHBOARD_CONTENT_HEIGHT }}>
        <p className="text-[11px] text-muted-custom">No sales data yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: DASHBOARD_CONTENT_HEIGHT }}>
      <div className="mb-2 grid shrink-0 grid-cols-[1fr_2.5rem_4.5rem] gap-2 pl-7 pr-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-muted-custom">
        <span>Product</span>
        <span className="text-right">Sold</span>
        <span className="text-right">Revenue</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        {items.map((item, i) => (
          <div
            key={item.productId}
            className="group flex min-h-0 flex-1 flex-col justify-center gap-1 border-b border-border-custom/30 py-1 last:border-0"
          >
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
            <div className="ml-7 h-1 overflow-hidden rounded-full bg-accent-pink/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#9a7358] to-[#c4a484] transition-all duration-700 ease-out group-hover:from-[#8a6348] group-hover:to-[#b8956a]"
                style={{ width: `${Math.max(8, (item.units / maxUnits) * 100)}%` }}
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
      <TopProductsShowcaseContent data={data} />
    </ChartCard>
  );
}

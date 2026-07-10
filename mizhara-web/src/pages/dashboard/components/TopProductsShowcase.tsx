import { formatINR } from "@/utils/format";
import ChartCard from "@/components/ChartCard";
import type { ProductSales } from "@/types/dashboard";

function TopProductsShowcaseContent({ data }: { data: ProductSales[] }) {
  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center">
        <p className="text-[11px] text-muted-custom">No sales data yet</p>
      </div>
    );
  }

  const items = data.slice(0, 5);

  return (
    <div className="flex h-[280px] flex-col">
      <div className="mb-3 flex shrink-0 items-center justify-between border-b border-border-custom/40 pb-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-custom">Lifetime leaders</p>
        <p className="text-[10px] tabular-nums text-muted-custom">By units sold</p>
      </div>
      <div className="flex flex-1 flex-col justify-between">
        {items.map((item, i) => (
          <div
            key={item.productId}
            className="flex items-center gap-3 border-b border-border-custom/30 py-1 last:border-0"
          >
            <span className="w-5 shrink-0 text-[10px] font-medium tabular-nums tracking-widest text-primary/45">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-primary-dark">{item.name}</p>
              <p className="mt-0.5 text-[10px] tabular-nums text-muted-custom">{formatINR(item.revenue)}</p>
            </div>
            <div className="shrink-0 pl-1 text-right">
              <p className="text-base font-bold tabular-nums tracking-tight text-primary-dark">{item.units}</p>
              <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-muted-custom">Sold</p>
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

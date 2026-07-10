import { formatINR } from "@/utils/format";
import ChartCard from "@/components/ChartCard";
import { categoryColor } from "@/utils/chartUtils";
import { DASHBOARD_CONTENT_HEIGHT } from "@/pages/dashboard/constants";
import type { CustomerSales } from "@/types/dashboard";

type TopCustomersChartProps = {
  data: CustomerSales[];
  title: string;
  subtitle: string;
  metric: "revenue" | "orders";
};

function TopCustomersLeaderboard({ data, metric }: { data: CustomerSales[]; metric: "revenue" | "orders" }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center" style={{ height: DASHBOARD_CONTENT_HEIGHT }}>
        <p className="text-[11px] text-muted-custom">No customer data yet</p>
      </div>
    );
  }

  const items = data.slice(0, 5);
  const maxValue = metric === "revenue" ? (items[0]?.revenue ?? 1) : (items[0]?.orders ?? 1);

  return (
    <div className="flex flex-col" style={{ height: DASHBOARD_CONTENT_HEIGHT }}>
      <div className="mb-2 grid shrink-0 grid-cols-[1fr_2.5rem_4.5rem] gap-2 pr-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-muted-custom">
        <span>Customer</span>
        <span className="text-right">Orders</span>
        <span className="text-right">Spent</span>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => {
          const value = metric === "revenue" ? item.revenue : item.orders;
          return (
            <div key={item.customerId} className="group border-b border-border-custom/30 pb-3 last:border-0 last:pb-0">
              <div className="grid grid-cols-[1fr_2.5rem_4.5rem] items-center gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full ring-2 ring-white"
                    style={{ backgroundColor: categoryColor(i) }}
                  />
                  <p className="truncate text-[11px] font-semibold text-primary-dark">{item.name}</p>
                </div>
                <p className="text-right text-[11px] font-bold tabular-nums text-primary-dark">{item.orders}</p>
                <p className="text-right text-[10px] font-semibold tabular-nums text-muted-custom">{formatINR(item.revenue)}</p>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-accent-pink/70">
                <div
                  className="h-full rounded-full transition-all duration-500 group-hover:opacity-90"
                  style={{
                    width: `${Math.max(8, (value / maxValue) * 100)}%`,
                    backgroundColor: categoryColor(i),
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

export default function TopCustomersChart({ data, title, subtitle, metric }: TopCustomersChartProps) {
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <TopCustomersLeaderboard data={data} metric={metric} />
    </ChartCard>
  );
}

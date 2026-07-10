import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import ChartCard from "@/components/ChartCard";
import { deliveryStatusColor, formatStatusLabel } from "@/utils/chartUtils";
import { DASHBOARD_CONTENT_HEIGHT } from "@/pages/dashboard/constants";
import type { StatusCount } from "@/types/dashboard";

const DELIVERY_STATUS_ORDER = ["processing", "shipped", "delivered"];

function sortDeliveryStatuses(data: StatusCount[]): StatusCount[] {
  const byStatus = new Map(data.map((item) => [item.status, item]));
  return DELIVERY_STATUS_ORDER.map((status) => byStatus.get(status)).filter(
    (item): item is StatusCount => item !== undefined,
  );
}

export default function DeliveryStatusChart({ data }: { data: StatusCount[] }) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const items = useMemo(() => sortDeliveryStatuses(data), [data]);
  const total = items.reduce((sum, item) => sum + item.count, 0);

  const chart = (() => {
    if (total === 0) {
      return (
        <div className="flex items-center justify-center" style={{ height: DASHBOARD_CONTENT_HEIGHT }}>
          <p className="text-[11px] text-muted-custom">No delivery data yet</p>
        </div>
      );
    }

    const renderSector = (props: PieSectorDataItem & { isActive?: boolean }) => {
      const { cx = 0, cy = 0, innerRadius = 0, outerRadius = 0, startAngle, endAngle, fill, isActive } = props;

      return (
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={isActive ? outerRadius + 8 : outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="#fff"
          strokeWidth={3}
          cornerRadius={8}
          style={{
            filter: isActive ? "url(#delivery-pie-shadow)" : undefined,
            transition: "all 0.25s ease",
          }}
        />
      );
    };

    return (
      <div
        className="flex min-h-0 items-stretch gap-4 overflow-hidden"
        style={{ height: DASHBOARD_CONTENT_HEIGHT }}
      >
        <div className="relative min-w-0 flex-1">
          <ResponsiveContainer width="100%" height={DASHBOARD_CONTENT_HEIGHT}>
            <PieChart>
              <defs>
                <filter id="delivery-pie-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#5c4a3d" floodOpacity="0.18" />
                </filter>
                {items.map((entry, i) => {
                  const color = deliveryStatusColor(entry.status, i);
                  return (
                    <linearGradient key={entry.status} id={`delivery-grad-${entry.status}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="55%" stopColor={color} stopOpacity={0.92} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.68} />
                    </linearGradient>
                  );
                })}
              </defs>
              <Pie
                data={items}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={64}
                outerRadius={90}
                paddingAngle={2}
                cornerRadius={8}
                stroke="#fff"
                strokeWidth={3}
                shape={renderSector}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                {items.map((entry, i) => (
                  <Cell key={entry.status} fill={`url(#delivery-grad-${entry.status})`} />
                ))}
              </Pie>
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload as StatusCount;
                  const pct = Math.round((item.count / total) * 100);
                  return (
                    <div className="rounded-xl border border-border-custom/80 bg-white/95 px-3.5 py-2.5 shadow-xl shadow-primary-dark/10 backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-custom">
                        {formatStatusLabel(item.status)}
                      </p>
                      <p className="mt-0.5 font-serif text-lg font-bold text-primary-dark tabular-nums">
                        {item.count}
                        <span className="ml-1.5 font-sans text-xs font-semibold text-muted-custom">({pct}%)</span>
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full border border-border-custom/40 bg-white/70 shadow-inner shadow-primary-dark/[0.04] backdrop-blur-[1px]">
              <div className="text-center">
                <p className="font-serif text-2xl font-bold text-primary-dark tabular-nums">{total}</p>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-custom">Orders</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-full min-h-0 w-[8.5rem] shrink-0 flex-col justify-start gap-2.5 overflow-y-auto overscroll-contain pr-0.5">
          {items.map((entry, i) => {
            const pct = Math.round((entry.count / total) * 100);
            const color = deliveryStatusColor(entry.status, i);
            const dimmed = activeIndex !== undefined && activeIndex !== i;

            return (
              <button
                key={entry.status}
                type="button"
                className={`min-w-0 rounded-lg px-1 py-1 text-left transition-all duration-200 ${
                  dimmed ? "opacity-35" : "opacity-100"
                } ${activeIndex === i ? "bg-accent-pink/35" : "hover:bg-accent-pink/20"}`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-[10px] font-semibold capitalize text-primary-dark">
                    {formatStatusLabel(entry.status)}
                  </p>
                  <p className="shrink-0 text-[9px] font-bold tabular-nums text-muted-custom">{pct}%</p>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-accent-pink/50">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(8, pct)}%`,
                      background: `linear-gradient(90deg, ${color}cc, ${color})`,
                    }}
                  />
                </div>
                <p className="mt-1 text-[9px] tabular-nums text-muted-custom">{entry.count} orders</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  })();

  return (
    <ChartCard title="Delivery Status" subtitle="Order fulfillment breakdown">
      {chart}
    </ChartCard>
  );
}

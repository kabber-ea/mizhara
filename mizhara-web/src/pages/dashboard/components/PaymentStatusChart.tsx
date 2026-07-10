import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import ChartCard from "@/components/ChartCard";
import { formatStatusLabel, paymentStatusColor } from "@/utils/chartUtils";
import type { StatusCount } from "@/types/dashboard";

export default function PaymentStatusChart({ data }: { data: StatusCount[] }) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const chart = (() => {
    if (total === 0) {
      return (
        <div className="flex h-[240px] items-center justify-center">
          <p className="text-[11px] text-muted-custom">No payment data yet</p>
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
          outerRadius={isActive ? outerRadius + 7 : outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="#fff"
          strokeWidth={2.5}
          cornerRadius={6}
        />
      );
    };

    return (
      <div className="flex h-[240px] items-center gap-5">
        <div className="relative min-w-0 flex-1">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={96}
                paddingAngle={4}
                cornerRadius={6}
                stroke="#fff"
                strokeWidth={2.5}
                shape={renderSector}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                {data.map((entry, i) => (
                  <Cell key={entry.status} fill={paymentStatusColor(entry.status, i)} />
                ))}
              </Pie>
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload as StatusCount;
                  const pct = Math.round((item.count / total) * 100);
                  return (
                    <div className="rounded-xl border border-border-custom/80 bg-white/95 px-3.5 py-2.5 shadow-xl shadow-primary-dark/8 backdrop-blur-sm">
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
            <div className="text-center">
              <p className="font-serif text-3xl font-bold text-primary-dark tabular-nums">{total}</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-custom">Orders</p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col justify-center gap-3.5 pr-1">
          {data.map((entry, i) => {
            const pct = Math.round((entry.count / total) * 100);
            const color = paymentStatusColor(entry.status, i);
            const dimmed = activeIndex !== undefined && activeIndex !== i;

            return (
              <button
                key={entry.status}
                type="button"
                className={`flex items-start gap-2.5 text-left transition-all duration-200 ${
                  dimmed ? "opacity-30" : "opacity-100"
                }`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                <span
                  className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold capitalize text-primary-dark">{formatStatusLabel(entry.status)}</p>
                  <p className="text-[10px] tabular-nums text-muted-custom">
                    {entry.count}
                    <span className="mx-1.5 text-border-custom">·</span>
                    {pct}%
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  })();

  return (
    <ChartCard title="Payment Status" subtitle="Collection overview">
      {chart}
    </ChartCard>
  );
}

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatINR } from "@/utils/format";
import ChartCard from "@/components/ChartCard";
import { CHART_COLORS, axisTick, chartMargin } from "@/utils/chartUtils";
import { renderChartTooltip } from "@/components/ChartTooltip";
import { DASHBOARD_PANEL_MIN_HEIGHT } from "@/constants/dashboard";

type RevenueTrendChartProps = {
  data: { date: string; revenue: number; orders: number }[];
  revenueTotal: number;
};

export default function RevenueTrendChart({ data, revenueTotal }: RevenueTrendChartProps) {
  return (
    <ChartCard title="Revenue Trend" subtitle={`${formatINR(revenueTotal)} over 30 days`}>
      <div className="h-full min-h-0 flex-1" style={{ minHeight: DASHBOARD_PANEL_MIN_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={chartMargin}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.25} />
                <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={CHART_COLORS.primaryLight} />
                <stop offset="100%" stopColor={CHART_COLORS.primary} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis
              dataKey="date"
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.slice(5)}
              dy={8}
            />
            <YAxis
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
              width={48}
            />
            <Tooltip
              content={renderChartTooltip(
                (v) => formatINR(v),
                (l) =>
                  new Date(l + "T00:00:00").toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  }),
              )}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="url(#revStroke)"
              fill="url(#revGrad)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: CHART_COLORS.primary, stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

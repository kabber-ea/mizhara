import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "@/components/ChartCard";
import {
  CHART_COLORS,
  axisTick,
  deliveryStatusColor,
  formatStatusLabel,
} from "@/utils/chartUtils";
import { renderChartTooltip } from "@/components/ChartTooltip";
import type { StatusCount } from "@/types/dashboard";

function splitStatusLabel(label: string): string[] {
  const words = label.split(" ");
  if (words.length <= 1 || label.length <= 11) return [label];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

type DeliveryAxisTickProps = {
  x?: string | number;
  y?: string | number;
  payload?: { value: string };
};

function DeliveryStatusAxisTick({ x = 0, y = 0, payload }: DeliveryAxisTickProps) {
  if (!payload) return null;
  const lines = splitStatusLabel(formatStatusLabel(payload.value));
  const tx = typeof x === "number" ? x : Number(x);
  const ty = typeof y === "number" ? y : Number(y);

  return (
    <g transform={`translate(${tx},${ty + 10})`}>
      <text
        textAnchor="middle"
        fill={CHART_COLORS.axis}
        fontSize={9}
        fontFamily="Roboto, sans-serif"
        fontWeight={500}
      >
        {lines.map((line, i) => (
          <tspan key={line} x={0} dy={i === 0 ? 0 : 11}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function DeliveryStatusBarChart({ data }: { data: StatusCount[] }) {
  if (!data.length) {
    return (
      <div className="flex h-[240px] items-center justify-center">
        <p className="text-[11px] text-muted-custom">No delivery data yet</p>
      </div>
    );
  }

  const items = [...data].sort((a, b) => b.count - a.count);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={items} margin={{ top: 22, right: 6, left: -14, bottom: 2 }} barCategoryGap="22%">
        <defs>
          {items.map((item, i) => {
            const color = deliveryStatusColor(item.status, i);
            return (
              <linearGradient key={item.status} id={`delGrad-${item.status}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.95} />
                <stop offset="100%" stopColor={color} stopOpacity={0.55} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis
          dataKey="status"
          tick={DeliveryStatusAxisTick}
          tickLine={false}
          axisLine={false}
          interval={0}
          height={46}
        />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
        <Tooltip
          content={renderChartTooltip(
            (v) => `${v} orders`,
            (l) => formatStatusLabel(l),
          )}
          cursor={{ fill: "rgba(154, 115, 88, 0.06)", radius: 8 }}
        />
        <Bar
          dataKey="count"
          radius={[8, 8, 0, 0]}
          maxBarSize={46}
          background={{ fill: "rgba(235, 228, 220, 0.5)", radius: 8 }}
          activeBar={{ stroke: "#fff", strokeWidth: 2 }}
        >
          {items.map((entry) => (
            <Cell key={entry.status} fill={`url(#delGrad-${entry.status})`} />
          ))}
          <LabelList
            dataKey="count"
            position="top"
            offset={6}
            style={{
              fontSize: 10,
              fontWeight: 700,
              fill: "#5c4a3d",
              fontFamily: "Roboto, sans-serif",
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function DeliveryStatusChart({ data }: { data: StatusCount[] }) {
  return (
    <ChartCard title="Delivery Status" subtitle="Order fulfillment breakdown">
      <DeliveryStatusBarChart data={data} />
    </ChartCard>
  );
}

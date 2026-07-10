import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { formatINR } from "@/lib/format";
import { api } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import TableSkeleton from "@/components/TableSkeleton";
import type { SerializedCustomer } from "@/types/admin";
import type { SerializedOrder } from "@/types/admin";

type DashboardData = {
  kpis: {
    totalRevenue: number;
    totalPaidOrders: number;
    avgOrderValue: number;
    totalCustomers: number;
    ordersToday: number;
    pendingShipments: number;
    lowStockCount: number;
  };
  charts: {
    revenueByDay: { date: string; revenue: number; orders: number }[];
    deliveryStatus: { status: string; count: number }[];
    paymentStatus: { status: string; count: number }[];
    topCategories: { category: string; revenue: number; units: number }[];
    trendingProducts: { productId: string; name: string; units: number; revenue: number }[];
    topProductsOverall: { productId: string; name: string; units: number; revenue: number }[];
  };
  recentOrders: SerializedOrder[];
  recentCustomers: SerializedCustomer[];
};

const CHART_COLORS = {
  primary: "#9a7358",
  primaryLight: "#c4a484",
  sage: "#7ba38c",
  rose: "#8b5a6b",
  gold: "#b8956a",
  grid: "#ebe4dc",
  axis: "#a39a92",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "#5c9e7a",
  pending: "#c9a227",
  failed: "#c4727a",
};

const DELIVERY_STATUS_COLORS: Record<string, string> = {
  processing: "#c9a227",
  packed: "#7b9eb5",
  shipped: "#8b7bb5",
  out_for_delivery: "#9a7358",
  delivered: "#5c9e7a",
  cancelled: "#c4727a",
  returned: "#c4845a",
};

const chartMargin = { top: 8, right: 8, left: -8, bottom: 0 };
const axisTick = { fontSize: 10, fill: CHART_COLORS.axis, fontFamily: "Roboto, sans-serif" };

const CATEGORY_COLORS = [
  "#9a7358",
  "#7ba38c",
  "#8b5a6b",
  "#b8956a",
  "#5c9e7a",
  "#7b9eb5",
  "#c4a484",
  "#c4727a",
];

function categoryColor(index: number) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

function deliveryStatusColor(status: string, index: number) {
  return DELIVERY_STATUS_COLORS[status] ?? ["#9a7358", "#7ba38c", "#c4a484"][index % 3];
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}

type ProductSales = { productId: string; name: string; units: number; revenue: number };
type CategorySales = { category: string; revenue: number; units: number };

function TrendingLeaderboard({ data }: { data: ProductSales[] }) {
  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center">
        <p className="text-[11px] text-muted-custom">No sales data yet</p>
      </div>
    );
  }

  const items = data.slice(0, 5);
  const maxUnits = items[0]?.units ?? 1;

  return (
    <div className="flex h-[280px] flex-col">
      <div className="mb-2 grid shrink-0 grid-cols-[1fr_2.5rem_4.5rem] gap-2 pl-7 pr-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-muted-custom">
        <span>Product</span>
        <span className="text-right">Sold</span>
        <span className="text-right">Revenue</span>
      </div>
      <div className="flex flex-1 flex-col justify-evenly">
        {items.map((item, i) => (
          <div key={item.productId} className="group">
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

function DeliveryStatusChart({ data }: { data: { status: string; count: number }[] }) {
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

function CategoryRevenueChart({ data }: { data: CategorySales[] }) {
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

function TopProductsShowcase({ data }: { data: ProductSales[] }) {
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

function paymentStatusColor(status: string, index: number) {
  return PAYMENT_STATUS_COLORS[status] ?? ["#8b5a6b", "#c4a484", "#7ba38c"][index % 3];
}

type TooltipContentProps = {
  active?: boolean;
  payload?: readonly { value?: unknown }[];
  label?: string | number;
};

function renderChartTooltip(
  valueFormatter?: (v: number) => string,
  labelFormatter?: (l: string) => string,
) {
  return function ChartTooltipContent({ active, payload, label }: TooltipContentProps) {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    const displayLabel = labelFormatter ? labelFormatter(String(label ?? "")) : String(label ?? "");
    const displayValue = valueFormatter ? valueFormatter(Number(item.value ?? 0)) : String(item.value ?? "");

    return (
      <div className="rounded-xl border border-border-custom/80 bg-white/95 px-3.5 py-2.5 shadow-xl shadow-primary-dark/8 backdrop-blur-sm">
        {displayLabel && (
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-custom">{displayLabel}</p>
        )}
        <p className="mt-0.5 font-serif text-lg font-bold text-primary-dark tabular-nums">{displayValue}</p>
      </div>
    );
  };
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-custom/80 bg-white shadow-sm shadow-primary-dark/[0.03]">
      <div className="border-b border-border-custom/50 bg-gradient-to-r from-accent-pink/40 to-white px-5 py-4">
        <h3 className="font-serif text-sm font-semibold text-primary-dark">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[10px] text-muted-custom">{subtitle}</p>}
      </div>
      <div className="overflow-hidden p-5 pt-4">{children}</div>
    </div>
  );
}

const KPI_ACCENTS = [
  { bg: "from-[#f8f3ed] to-white", accent: "text-primary", ring: "ring-primary/15" },
  { bg: "from-[#f0f5f2] to-white", accent: "text-[#5c9e7a]", ring: "ring-[#5c9e7a]/15" },
  { bg: "from-[#f5f0f3] to-white", accent: "text-[#8b5a6b]", ring: "ring-[#8b5a6b]/15" },
  { bg: "from-[#f8f4ee] to-white", accent: "text-accent-gold", ring: "ring-accent-gold/20" },
] as const;

function KpiIcon({ type }: { type: "revenue" | "orders" | "customers" | "shipments" }) {
  const paths = {
    revenue: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    orders: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    ),
    customers: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    ),
    shipments: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2h8zm0 0l3 3m-3-3l3-3M3 16h10"
      />
    ),
  };

  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {paths[type]}
    </svg>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  accentIndex = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: "revenue" | "orders" | "customers" | "shipments";
  accentIndex?: number;
}) {
  const accent = KPI_ACCENTS[accentIndex % KPI_ACCENTS.length];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border-custom/70 bg-gradient-to-br ${accent.bg} p-5 shadow-sm shadow-primary-dark/[0.04] transition-shadow duration-300 hover:shadow-md hover:shadow-primary-dark/[0.06]`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-custom">{label}</span>
          <p className="mt-2 font-serif text-2xl font-bold tracking-tight text-primary-dark tabular-nums sm:text-[1.65rem]">
            {value}
          </p>
          {sub && <p className="mt-1.5 text-[10px] leading-relaxed text-muted-custom">{sub}</p>}
        </div>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 ring-1 ${accent.ring} ${accent.accent} shadow-sm`}
        >
          <KpiIcon type={icon} />
        </div>
      </div>
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/40 blur-2xl transition-opacity duration-300 group-hover:opacity-70" />
    </div>
  );
}

function PaymentDonutChart({ data }: { data: { status: string; count: number }[] }) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const total = data.reduce((sum, item) => sum + item.count, 0);

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
                const item = payload[0].payload as { status: string; count: number };
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
}

function CustomerInitials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-pink text-[10px] font-bold text-primary-dark ring-1 ring-border-custom/60">
      {initials}
    </span>
  );
}

export default function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardData>("/api/dashboard")
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-9 w-48 animate-pulse rounded-lg bg-accent-pink/60" />
          <div className="mt-2 h-3 w-72 animate-pulse rounded bg-accent-pink/30" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-2xl border border-border-custom/60 bg-white p-5">
              <div className="h-3 w-20 animate-pulse rounded bg-accent-pink/40" />
              <div className="h-8 w-28 animate-pulse rounded bg-accent-pink/60" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl border border-border-custom/60 bg-white" />
          ))}
        </div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center">
        <p className="font-serif text-lg text-primary-dark">Unable to load dashboard</p>
        <p className="mt-2 text-xs text-muted-custom">
          Run <code className="rounded bg-accent-pink px-1.5 py-0.5 font-mono text-[11px]">npm run seed</code> first
        </p>
      </div>
    );
  }

  const { kpis, charts, recentOrders, recentCustomers } = data;
  const revenueByDay = charts.revenueByDay ?? [];
  const deliveryStatus = charts.deliveryStatus ?? [];
  const paymentStatus = charts.paymentStatus ?? [];
  const topCategories = charts.topCategories ?? [];
  const trendingProducts = charts.trendingProducts ?? [];
  const topProductsOverall = charts.topProductsOverall ?? [];
  const orders = recentOrders ?? [];
  const customers = recentCustomers ?? [];

  const revenueTotal = revenueByDay.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Admin</p>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-primary-dark sm:text-4xl">Dashboard</h1>
          <p className="mt-1.5 text-xs text-muted-custom">Sales performance, customers, and fulfillment at a glance</p>
        </div>
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-custom">
          Last 30 days
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total Revenue"
          value={formatINR(kpis.totalRevenue)}
          sub={`${kpis.totalPaidOrders} paid orders`}
          icon="revenue"
          accentIndex={0}
        />
        <KpiCard label="Orders Today" value={String(kpis.ordersToday)} icon="orders" accentIndex={1} />
        <KpiCard
          label="Customers"
          value={String(kpis.totalCustomers)}
          sub={`Avg order ${formatINR(kpis.avgOrderValue)}`}
          icon="customers"
          accentIndex={2}
        />
        <KpiCard
          label="Pending Shipments"
          value={String(kpis.pendingShipments)}
          sub={`${kpis.lowStockCount} out of stock`}
          icon="shipments"
          accentIndex={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Revenue Trend" subtitle={`${formatINR(revenueTotal)} over 30 days`}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueByDay} margin={chartMargin}>
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
        </ChartCard>

        <ChartCard title="Delivery Status" subtitle="Order fulfillment breakdown">
          <DeliveryStatusChart data={deliveryStatus} />
        </ChartCard>

        <ChartCard title="Payment Status" subtitle="Collection overview">
          <PaymentDonutChart data={paymentStatus} />
        </ChartCard>

        <ChartCard title="Top Categories" subtitle="Revenue share by category">
          <CategoryRevenueChart data={topCategories} />
        </ChartCard>

        <ChartCard title="Trending" subtitle="Best sellers in the last 30 days">
          <TrendingLeaderboard data={trendingProducts} />
        </ChartCard>

        <ChartCard title="Best Selling" subtitle="Lifetime best sellers">
          <TopProductsShowcase data={topProductsOverall} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border-custom/80 bg-white shadow-sm shadow-primary-dark/[0.03]">
          <div className="border-b border-border-custom/50 bg-gradient-to-r from-accent-pink/40 to-white px-5 py-4">
            <h3 className="font-serif text-sm font-semibold text-primary-dark">Recent Orders</h3>
            <p className="mt-0.5 text-[10px] text-muted-custom">Latest transactions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-custom/50 bg-accent-pink/20">
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-custom">
                    Order
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-custom">
                    Customer
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-custom">
                    Total
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-custom">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-border-custom/30 transition-colors last:border-0 hover:bg-accent-pink/15"
                  >
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-accent-pink/50 px-2 py-0.5 font-mono text-[10px] font-medium text-primary-dark">
                        {o.orderNumber}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs font-medium text-primary-dark">{o.customerName}</td>
                    <td className="px-3 py-3 font-serif text-xs font-semibold tabular-nums text-primary-dark">
                      {formatINR(o.total)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={o.deliveryStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border-custom/80 bg-white shadow-sm shadow-primary-dark/[0.03]">
          <div className="border-b border-border-custom/50 bg-gradient-to-r from-accent-pink/40 to-white px-5 py-4">
            <h3 className="font-serif text-sm font-semibold text-primary-dark">New Customers</h3>
            <p className="mt-0.5 text-[10px] text-muted-custom">Recently joined</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-custom/50 bg-accent-pink/20">
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-custom">
                    Customer
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-custom">
                    Orders
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-muted-custom">
                    Spent
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border-custom/30 transition-colors last:border-0 hover:bg-accent-pink/15"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <CustomerInitials name={c.name} />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-primary-dark">{c.name}</p>
                          <p className="truncate text-[10px] text-muted-custom">{c.email ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs tabular-nums text-primary-dark">{c.orderCount}</td>
                    <td className="px-5 py-3 font-serif text-xs font-semibold tabular-nums text-primary-dark">
                      {formatINR(c.totalSpent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

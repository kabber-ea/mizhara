import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR } from "@/lib/format";
import { api } from "@/lib/api";
import StatusBadge from "@/components/admin/StatusBadge";
import AdminTableSkeleton from "@/components/admin/AdminTableSkeleton";
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
  };
  recentOrders: SerializedOrder[];
  recentCustomers: SerializedCustomer[];
};

const CHART_COLORS = ["#8B5A6B", "#C4A484", "#7BA38C", "#D4A5B5", "#A8C5B8", "#E8B4B8"];

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-5 bg-white border border-border-custom rounded-2xl">
      <span className="text-[10px] font-bold text-muted-custom uppercase">{label}</span>
      <p className="text-2xl font-extrabold text-primary-dark mt-1">{value}</p>
      {sub && <p className="text-[10px] text-muted-custom mt-1">{sub}</p>}
    </div>
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
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-dark">Dashboard</h1>
          <p className="text-xs text-muted-custom mt-1">Overview of sales, customers, and fulfillment</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-5 bg-white border border-border-custom rounded-2xl space-y-2">
              <div className="h-3 w-20 rounded bg-accent-pink/20"  />
              <div className="h-7 w-28 rounded bg-accent-mint/40"  />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
          <div className="h-64 bg-white border border-border-custom rounded-2xl"  />
          <div className="h-64 bg-white border border-border-custom rounded-2xl"  />
        </div>
        <AdminTableSkeleton rows={4}  />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-xs text-muted-custom">
        Failed to load dashboard. Run <code>npm run seed</code> first.
      </div>
    );
  }

  const { kpis, charts, recentOrders, recentCustomers } = data;
  const revenueByDay = charts.revenueByDay ?? [];
  const deliveryStatus = charts.deliveryStatus ?? [];
  const paymentStatus = charts.paymentStatus ?? [];
  const topCategories = charts.topCategories ?? [];
  const orders = recentOrders ?? [];
  const customers = recentCustomers ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary-dark">Dashboard</h1>
        <p className="text-xs text-muted-custom mt-1">Overview of sales, customers, and fulfillment</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value={formatINR(kpis.totalRevenue)} sub={`${kpis.totalPaidOrders} paid orders`}  />
        <KpiCard label="Orders Today" value={String(kpis.ordersToday)}  />
        <KpiCard label="Customers" value={String(kpis.totalCustomers)} sub={`Avg order ${formatINR(kpis.avgOrderValue)}`}  />
        <KpiCard label="Pending Shipments" value={String(kpis.pendingShipments)} sub={`${kpis.lowStockCount} out of stock`}  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-border-custom rounded-2xl p-5">
          <h3 className="text-xs font-bold text-primary-dark uppercase mb-4">Revenue (30 days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueByDay}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5A6B" stopOpacity={0.3}  />
                  <stop offset="95%" stopColor="#8B5A6B" stopOpacity={0}  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe8"  />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(v) => v.slice(5)}  />
              <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => `₹${v / 1000}k`}  />
              <Tooltip formatter={(v) => formatINR(Number(v))} labelFormatter={(l) => `Date: ${l}`}  />
              <Area type="monotone" dataKey="revenue" stroke="#8B5A6B" fill="url(#revGrad)" strokeWidth={2}  />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-border-custom rounded-2xl p-5">
          <h3 className="text-xs font-bold text-primary-dark uppercase mb-4">Orders by Delivery Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deliveryStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe8"  />
              <XAxis dataKey="status" tick={{ fontSize: 8 }} tickFormatter={(v) => v.replace(/_/g, " ")}  />
              <YAxis tick={{ fontSize: 9 }} allowDecimals={false}  />
              <Tooltip  />
              <Bar dataKey="count" fill="#7BA38C" radius={[4, 4, 0, 0]}  />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-border-custom rounded-2xl p-5">
          <h3 className="text-xs font-bold text-primary-dark uppercase mb-4">Payment Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={paymentStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {paymentStatus.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]}  />
                ))}
              </Pie>
              <Tooltip  />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-border-custom rounded-2xl p-5">
          <h3 className="text-xs font-bold text-primary-dark uppercase mb-4">Top Categories by Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topCategories} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe8"  />
              <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={(v) => `₹${v / 1000}k`}  />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 9 }} width={80}  />
              <Tooltip formatter={(v) => formatINR(Number(v))}  />
              <Bar dataKey="revenue" fill="#C4A484" radius={[0, 4, 4, 0]}  />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-border-custom rounded-2xl p-5 overflow-hidden">
          <h3 className="text-xs font-bold text-primary-dark uppercase mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] text-muted-custom uppercase border-b border-border-custom/50">
                  <th className="pb-2 pr-2">Order</th>
                  <th className="pb-2 pr-2">Customer</th>
                  <th className="pb-2 pr-2">Total</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border-custom/30">
                    <td className="py-2 pr-2 font-mono text-[10px]">{o.orderNumber}</td>
                    <td className="py-2 pr-2">{o.customerName}</td>
                    <td className="py-2 pr-2">{formatINR(o.total)}</td>
                    <td className="py-2">
                      <StatusBadge status={o.deliveryStatus}  />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-border-custom rounded-2xl p-5 overflow-hidden">
          <h3 className="text-xs font-bold text-primary-dark uppercase mb-4">New Customers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] text-muted-custom uppercase border-b border-border-custom/50">
                  <th className="pb-2 pr-2">Name</th>
                  <th className="pb-2 pr-2">Email</th>
                  <th className="pb-2 pr-2">Orders</th>
                  <th className="pb-2">Spent</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-border-custom/30">
                    <td className="py-2 pr-2 font-semibold">{c.name}</td>
                    <td className="py-2 pr-2 text-muted-custom">{c.email ?? "—"}</td>
                    <td className="py-2 pr-2">{c.orderCount}</td>
                    <td className="py-2">{formatINR(c.totalSpent)}</td>
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

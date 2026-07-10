import { useEffect, useState } from "react";
import { formatINR } from "@/utils/format";
import { api } from "@/lib/api";
import CategoryRevenueChart from "@/pages/dashboard/components/CategoryRevenueChart";
import DashboardSkeleton from "@/pages/dashboard/components/DashboardSkeleton";
import DeliveryStatusChart from "@/pages/dashboard/components/DeliveryStatusChart";
import KpiCard from "@/pages/dashboard/components/KpiCard";
import PaymentStatusChart from "@/pages/dashboard/components/PaymentStatusChart";
import RecentCustomersTable from "@/pages/dashboard/components/RecentCustomersTable";
import RecentOrdersTable from "@/pages/dashboard/components/RecentOrdersTable";
import RevenueTrendChart from "@/pages/dashboard/components/RevenueTrendChart";
import TopProductsShowcase from "@/pages/dashboard/components/TopProductsShowcase";
import TrendingLeaderboard from "@/pages/dashboard/components/TrendingLeaderboard";
import type { DashboardData } from "@/types/dashboard";

export default function DashboardPage() {
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
    return <DashboardSkeleton />;
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
        <RevenueTrendChart data={revenueByDay} revenueTotal={revenueTotal} />
        <DeliveryStatusChart data={deliveryStatus} />
        <PaymentStatusChart data={paymentStatus} />
        <CategoryRevenueChart data={topCategories} />
        <TrendingLeaderboard data={trendingProducts} />
        <TopProductsShowcase data={topProductsOverall} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentOrdersTable orders={orders} />
        <RecentCustomersTable customers={customers} />
      </div>
    </div>
  );
}

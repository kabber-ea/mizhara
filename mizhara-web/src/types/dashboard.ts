import type { SerializedOrder } from "@/types/admin";

export type DashboardData = {
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
    topCategories: { category: string; revenue: number }[];
    topCustomers: { customerId: string; name: string; revenue: number; orders: number }[];
    topCustomersByOrders: { customerId: string; name: string; revenue: number; orders: number }[];
    trendingProducts: { productId: string; name: string; units: number; revenue: number }[];
    topProductsOverall: { productId: string; name: string; units: number; revenue: number }[];
  };
  recentOrders: SerializedOrder[];
};

export type ProductSales = { productId: string; name: string; units: number; revenue: number };
export type CategorySales = { category: string; revenue: number };
export type CustomerSales = { customerId: string; name: string; revenue: number; orders: number };
export type StatusCount = { status: string; count: number };

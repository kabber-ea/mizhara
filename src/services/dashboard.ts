import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import { getRecentCustomers } from "@/services/customers";
import { listOrders } from "@/services/orders";

export async function getDashboardData() {
  await dbConnect();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalCustomers,
    paidOrdersAgg,
    ordersToday,
    pendingShipments,
    paymentBreakdown,
    deliveryBreakdown,
    revenueByDay,
    topCategories,
    lowStockCount,
    recentOrders,
    recentCustomers,
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: "$total" },
        },
      },
    ]),
    Order.countDocuments({ createdAt: { $gte: startOfToday } }),
    Order.countDocuments({
      paymentStatus: "paid",
      deliveryStatus: { $in: ["processing", "packed", "shipped", "out_for_delivery"] },
    }),
    Order.aggregate([{ $group: { _id: "$paymentStatus", count: { $sum: 1 } } }]),
    Order.aggregate([{ $group: { _id: "$deliveryStatus", count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: { $ifNull: ["$items.category", "Uncategorized"] },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          units: { $sum: "$items.quantity" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),
    Product.countDocuments({ inStock: false }),
    listOrders({ page: 1, limit: 5, skip: 0, search: "" }),
    getRecentCustomers(5),
  ]);

  const paidStats = paidOrdersAgg[0] ?? { totalRevenue: 0, orderCount: 0, avgOrderValue: 0 };

  const revenueSeries: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = revenueByDay.find((r: { _id: string }) => r._id === key);
    revenueSeries.push({
      date: key,
      revenue: found?.revenue ?? 0,
      orders: found?.orders ?? 0,
    });
  }

  return {
    kpis: {
      totalRevenue: paidStats.totalRevenue,
      totalPaidOrders: paidStats.orderCount,
      avgOrderValue: Math.round(paidStats.avgOrderValue ?? 0),
      totalCustomers,
      ordersToday,
      pendingShipments,
      lowStockCount,
    },
    charts: {
      revenueByDay: revenueSeries,
      deliveryStatus: deliveryBreakdown.map((d: { _id: string; count: number }) => ({
        status: d._id,
        count: d.count,
      })),
      paymentStatus: paymentBreakdown.map((p: { _id: string; count: number }) => ({
        status: p._id,
        count: p.count,
      })),
      topCategories: topCategories.map((c: { _id: string; revenue: number; units: number }) => ({
        category: c._id,
        revenue: c.revenue,
        units: c.units,
      })),
    },
    recentOrders: recentOrders.items,
    recentCustomers,
  };
}

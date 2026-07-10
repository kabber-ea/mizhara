package services

import (
	"context"
	"math"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/store"
)

func GetDashboardDataForAdmin(ctx context.Context, session *lib.SessionPayload) (map[string]interface{}, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	return GetDashboardData(ctx)
}

func GetDashboardData(ctx context.Context) (map[string]interface{}, error) {
	now := time.Now()
	thirtyDaysAgo := now.AddDate(0, 0, -30)

	newCustomers, _ := store.CountCustomersSince(ctx, thirtyDaysAgo)
	pendingShipments, _ := store.CountPendingShipments(ctx, thirtyDaysAgo)
	lowStockCount, _ := store.CountLowStockProducts(ctx)

	kpis, _ := store.PaidOrderKPIsSince(ctx, thirtyDaysAgo)

	recentOrdersList := []SerializedOrder{}
	if result, err := ListOrders(ctx, OrderListParams{
		Page: 1, Limit: 5, CreatedAfter: &thirtyDaysAgo,
	}); err == nil && result != nil {
		if items, ok := result["items"].([]SerializedOrder); ok {
			recentOrdersList = items
		}
	}

	revenueRows, _ := store.RevenueByDaySince(ctx, thirtyDaysAgo)
	revenueByDay := make([]map[string]interface{}, 0, len(revenueRows))
	for _, r := range revenueRows {
		revenueByDay = append(revenueByDay, map[string]interface{}{
			"date": r.Date, "revenue": r.Revenue, "orders": r.Orders,
		})
	}

	deliveryRows, _ := store.DeliveryStatusCountsSince(ctx, &thirtyDaysAgo)
	deliveryStatus := make([]map[string]interface{}, 0, len(deliveryRows))
	for _, r := range deliveryRows {
		deliveryStatus = append(deliveryStatus, map[string]interface{}{
			"status": r.Status, "count": r.Count,
		})
	}

	catRows, _ := store.TopCategoriesSince(ctx, thirtyDaysAgo)
	topCategories := make([]map[string]interface{}, 0, len(catRows))
	for _, r := range catRows {
		topCategories = append(topCategories, map[string]interface{}{
			"category": r.Category, "revenue": r.Revenue,
		})
	}

	trendingRows, _ := store.TopProductsSince(ctx, &thirtyDaysAgo, 8)
	trendingProducts := productSalesToMaps(trendingRows)
	topProductsOverall := trendingProducts

	return map[string]interface{}{
		"kpis": map[string]interface{}{
			"totalRevenue": kpis.TotalRevenue, "totalPaidOrders": kpis.OrderCount,
			"avgOrderValue": int(math.Round(kpis.AvgOrderValue)), "newCustomers": newCustomers,
			"pendingShipments": pendingShipments, "lowStockCount": lowStockCount,
		},
		"charts": map[string]interface{}{
			"revenueByDay": revenueByDay, "deliveryStatus": deliveryStatus,
			"topCategories": topCategories, "trendingProducts": trendingProducts,
			"topProductsOverall": topProductsOverall,
		},
		"recentOrders": recentOrdersList,
	}, nil
}

func productSalesToMaps(rows []store.ProductSales) []map[string]interface{} {
	out := make([]map[string]interface{}, 0, len(rows))
	for _, r := range rows {
		out = append(out, map[string]interface{}{
			"productId": r.ProductID, "name": r.Name, "units": r.Units, "revenue": r.Revenue,
		})
	}
	return out
}

package services

import (
	"context"
	"math"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"
	"go.mongodb.org/mongo-driver/bson"
)

func GetDashboardDataForAdmin(ctx context.Context, session *lib.SessionPayload) (map[string]interface{}, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	return GetDashboardData(ctx)
}

func GetDashboardData(ctx context.Context) (map[string]interface{}, error) {
	now := time.Now()
	startOfToday := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	thirtyDaysAgo := now.AddDate(0, 0, -30)

	totalCustomers, _ := lib.Users().CountDocuments(ctx, bson.M{"role": models.RoleCustomer})
	ordersToday, _ := lib.Orders().CountDocuments(ctx, bson.M{"createdAt": bson.M{"$gte": startOfToday}})
	pendingShipments, _ := lib.Orders().CountDocuments(ctx, bson.M{
		"paymentStatus": models.PaymentPaid,
		"deliveryStatus": bson.M{"$in": bson.A{
			models.DeliveryProcessing, models.DeliveryPacked, models.DeliveryShipped, models.DeliveryOutForDelivery,
		}},
	})
	lowStockCount, _ := lib.Products().CountDocuments(ctx, bson.M{"$or": bson.A{
		bson.M{"inStock": false},
		bson.M{"stockQuantity": bson.M{"$lte": 5, "$gt": 0}},
	}})

	var paidAgg []bson.M
	cur, err := lib.Orders().Aggregate(ctx, bson.A{
		bson.M{"$match": bson.M{"paymentStatus": models.PaymentPaid}},
		bson.M{"$group": bson.M{
			"_id": nil, "totalRevenue": bson.M{"$sum": "$total"},
			"orderCount": bson.M{"$sum": 1}, "avgOrderValue": bson.M{"$avg": "$total"},
		}},
	})
	if err == nil {
		defer cur.Close(ctx)
		_ = cur.All(ctx, &paidAgg)
	}

	totalRevenue, totalPaidOrders, avgOrderValue := 0.0, 0, 0.0
	if len(paidAgg) > 0 {
		totalRevenue = num(paidAgg[0]["totalRevenue"])
		totalPaidOrders = int(num(paidAgg[0]["orderCount"]))
		avgOrderValue = num(paidAgg[0]["avgOrderValue"])
	}

	recentOrdersList := []SerializedOrder{}
	if result, err := ListOrders(ctx, OrderListParams{Page: 1, Limit: 5}); err == nil && result != nil {
		if items, ok := result["items"].([]SerializedOrder); ok {
			recentOrdersList = items
		}
	}

	recentCustomers := []SerializedUser{}
	if users, err := GetRecentUsers(ctx, 5); err == nil && users != nil {
		recentCustomers = users
	}

	revenueByDay := aggregateRevenueByDay(ctx, thirtyDaysAgo)
	deliveryStatus := aggregateStatusCounts(ctx, "$deliveryStatus")
	paymentStatus := aggregateStatusCounts(ctx, "$paymentStatus")
	topCategories := aggregateTopCategories(ctx)

	return map[string]interface{}{
		"kpis": map[string]interface{}{
			"totalRevenue": totalRevenue, "totalPaidOrders": totalPaidOrders,
			"avgOrderValue": int(math.Round(avgOrderValue)), "totalCustomers": totalCustomers,
			"ordersToday": ordersToday, "pendingShipments": pendingShipments,
			"lowStockCount": lowStockCount,
		},
		"charts": map[string]interface{}{
			"revenueByDay":   revenueByDay,
			"deliveryStatus": deliveryStatus,
			"paymentStatus":  paymentStatus,
			"topCategories":  topCategories,
		},
		"recentOrders":    recentOrdersList,
		"recentCustomers": recentCustomers,
	}, nil
}

func aggregateRevenueByDay(ctx context.Context, since time.Time) []map[string]interface{} {
	out := []map[string]interface{}{}
	cur, err := lib.Orders().Aggregate(ctx, bson.A{
		bson.M{"$match": bson.M{
			"paymentStatus": models.PaymentPaid,
			"createdAt":     bson.M{"$gte": since},
		}},
		bson.M{"$group": bson.M{
			"_id": bson.M{"$dateToString": bson.M{"format": "%Y-%m-%d", "date": "$createdAt"}},
			"revenue": bson.M{"$sum": "$total"},
			"orders":  bson.M{"$sum": 1},
		}},
		bson.M{"$sort": bson.M{"_id": 1}},
	})
	if err != nil {
		return out
	}
	defer cur.Close(ctx)
	for cur.Next(ctx) {
		var row bson.M
		if cur.Decode(&row) != nil {
			continue
		}
		out = append(out, map[string]interface{}{
			"date":    str(row["_id"]),
			"revenue": num(row["revenue"]),
			"orders":  int(num(row["orders"])),
		})
	}
	return out
}

func aggregateStatusCounts(ctx context.Context, field string) []map[string]interface{} {
	out := []map[string]interface{}{}
	cur, err := lib.Orders().Aggregate(ctx, bson.A{
		bson.M{"$group": bson.M{
			"_id":   field,
			"count": bson.M{"$sum": 1},
		}},
		bson.M{"$sort": bson.M{"count": -1}},
	})
	if err != nil {
		return out
	}
	defer cur.Close(ctx)
	for cur.Next(ctx) {
		var row bson.M
		if cur.Decode(&row) != nil {
			continue
		}
		out = append(out, map[string]interface{}{
			"status": str(row["_id"]),
			"count":  int(num(row["count"])),
		})
	}
	return out
}

func aggregateTopCategories(ctx context.Context) []map[string]interface{} {
	out := []map[string]interface{}{}
	cur, err := lib.Orders().Aggregate(ctx, bson.A{
		bson.M{"$match": bson.M{"paymentStatus": models.PaymentPaid}},
		bson.M{"$unwind": "$items"},
		bson.M{"$group": bson.M{
			"_id":     "$items.category",
			"revenue": bson.M{"$sum": bson.M{"$multiply": bson.A{"$items.price", "$items.quantity"}}},
			"units":   bson.M{"$sum": "$items.quantity"},
		}},
		bson.M{"$sort": bson.M{"revenue": -1}},
		bson.M{"$limit": 8},
	})
	if err != nil {
		return out
	}
	defer cur.Close(ctx)
	for cur.Next(ctx) {
		var row bson.M
		if cur.Decode(&row) != nil {
			continue
		}
		category := str(row["_id"])
		if category == "" {
			category = "Uncategorized"
		}
		out = append(out, map[string]interface{}{
			"category": category,
			"revenue":  num(row["revenue"]),
			"units":    int(num(row["units"])),
		})
	}
	return out
}

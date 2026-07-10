package services

import (
	"context"
	"math"
	"sort"
	"time"

	"mizhara-backend/constants"
	"mizhara-backend/lib"
	"mizhara-backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
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
	paidWindow := bson.M{
		"paymentStatus": models.PaymentPaid,
		"createdAt":     bson.M{"$gte": thirtyDaysAgo},
	}

	newCustomers, _ := lib.Users().CountDocuments(ctx, bson.M{
		"role":      models.RoleCustomer,
		"createdAt": bson.M{"$gte": thirtyDaysAgo},
	})
	pendingShipments, _ := lib.Orders().CountDocuments(ctx, bson.M{
		"paymentStatus": models.PaymentPaid,
		"createdAt":     bson.M{"$gte": thirtyDaysAgo},
		"deliveryStatus": bson.M{"$in": bson.A{
			models.DeliveryProcessing, models.DeliveryShipped,
		}},
	})
	lowStockCount, _ := lib.Products().CountDocuments(ctx, bson.M{"$or": bson.A{
		bson.M{"inStock": false},
		bson.M{"stockQuantity": bson.M{"$lte": 5, "$gt": 0}},
	}})

	var paidAgg []bson.M
	cur, err := lib.Orders().Aggregate(ctx, bson.A{
		bson.M{"$match": paidWindow},
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
	if result, err := ListOrders(ctx, OrderListParams{
		Page: 1, Limit: 5, CreatedAfter: &thirtyDaysAgo,
	}); err == nil && result != nil {
		if items, ok := result["items"].([]SerializedOrder); ok {
			recentOrdersList = items
		}
	}

	revenueByDay := aggregateRevenueByDay(ctx, thirtyDaysAgo)
	deliveryStatus := aggregateStatusCounts(ctx, "$deliveryStatus", &thirtyDaysAgo)
	topCategories := aggregateTopCategories(ctx, thirtyDaysAgo)
	trendingProducts := aggregateTopProducts(ctx, &thirtyDaysAgo)
	topProductsOverall := aggregateTopProducts(ctx, &thirtyDaysAgo)

	return map[string]interface{}{
		"kpis": map[string]interface{}{
			"totalRevenue": totalRevenue, "totalPaidOrders": totalPaidOrders,
			"avgOrderValue": int(math.Round(avgOrderValue)), "newCustomers": newCustomers,
			"pendingShipments": pendingShipments, "lowStockCount": lowStockCount,
		},
		"charts": map[string]interface{}{
			"revenueByDay":       revenueByDay,
			"deliveryStatus":     deliveryStatus,
			"topCategories":      topCategories,
			"trendingProducts":   trendingProducts,
			"topProductsOverall": topProductsOverall,
		},
		"recentOrders": recentOrdersList,
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

func aggregateStatusCounts(ctx context.Context, field string, since *time.Time) []map[string]interface{} {
	out := []map[string]interface{}{}
	pipeline := bson.A{}
	if since != nil {
		pipeline = append(pipeline, bson.M{"$match": bson.M{"createdAt": bson.M{"$gte": *since}}})
	}
	pipeline = append(pipeline,
		bson.M{"$group": bson.M{
			"_id":   field,
			"count": bson.M{"$sum": 1},
		}},
		bson.M{"$sort": bson.M{"count": -1}},
	)
	cur, err := lib.Orders().Aggregate(ctx, pipeline)
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

func aggregateTopCategories(ctx context.Context, since time.Time) []map[string]interface{} {
	out := []map[string]interface{}{}

	revenueByCategory := map[string]float64{}
	cur, err := lib.Orders().Aggregate(ctx, bson.A{
		bson.M{"$match": bson.M{
			"paymentStatus": models.PaymentPaid,
			"createdAt":     bson.M{"$gte": since},
		}},
		bson.M{"$unwind": "$items"},
		bson.M{"$group": bson.M{
			"_id":     "$items.category",
			"revenue": bson.M{"$sum": bson.M{"$multiply": bson.A{"$items.price", "$items.quantity"}}},
		}},
	})
	if err == nil {
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
			revenueByCategory[category] = num(row["revenue"])
		}
	}

	type categoryRevenue struct {
		name    string
		revenue float64
	}
	entries := []categoryRevenue{}

	catCur, err := lib.Categories().Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "name", Value: 1}}))
	if err != nil {
		return out
	}
	defer catCur.Close(ctx)
	for catCur.Next(ctx) {
		var cat models.Category
		if catCur.Decode(&cat) != nil || cat.Name == "" {
			continue
		}
		entries = append(entries, categoryRevenue{
			name:    cat.Name,
			revenue: revenueByCategory[cat.Name],
		})
	}

	sort.Slice(entries, func(i, j int) bool {
		if entries[i].revenue != entries[j].revenue {
			return entries[i].revenue > entries[j].revenue
		}
		return entries[i].name < entries[j].name
	})

	if len(entries) > constants.TopCategoryLimit {
		entries = entries[:constants.TopCategoryLimit]
	}

	for _, entry := range entries {
		out = append(out, map[string]interface{}{
			"category": entry.name,
			"revenue":  entry.revenue,
		})
	}
	return out
}

func aggregateTopProducts(ctx context.Context, since *time.Time) []map[string]interface{} {
	out := []map[string]interface{}{}
	match := bson.M{"paymentStatus": models.PaymentPaid}
	if since != nil {
		match["createdAt"] = bson.M{"$gte": *since}
	}

	cur, err := lib.Orders().Aggregate(ctx, bson.A{
		bson.M{"$match": match},
		bson.M{"$unwind": "$items"},
		bson.M{"$group": bson.M{
			"_id":     "$items.productId",
			"name":    bson.M{"$first": "$items.name"},
			"units":   bson.M{"$sum": "$items.quantity"},
			"revenue": bson.M{"$sum": bson.M{"$multiply": bson.A{"$items.price", "$items.quantity"}}},
		}},
		bson.M{"$sort": bson.M{"units": -1}},
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
		name := str(row["name"])
		if name == "" {
			name = "Unknown product"
		}
		out = append(out, map[string]interface{}{
			"productId": str(row["_id"]),
			"name":      name,
			"units":     int(num(row["units"])),
			"revenue":   num(row["revenue"]),
		})
	}
	return out
}

package services

import (
	"context"
	"regexp"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type SerializedUser struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	Email      string  `json:"email,omitempty"`
	Phone      string  `json:"phone,omitempty"`
	CreatedAt  string  `json:"createdAt"`
	OrderCount int     `json:"orderCount"`
	TotalSpent float64 `json:"totalSpent"`
}

var customerSortFields = map[string]string{
	"name":      "name",
	"email":     "email",
	"phone":     "phone",
	"createdAt": "createdAt",
}

func ListUsersForAdmin(ctx context.Context, session *lib.SessionPayload, page, limit, search, sortBy, sortDir string) (map[string]interface{}, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	p := lib.ParsePagination(page, limit, search)
	return ListUsers(ctx, p.Page, p.Limit, p.Skip, p.Search, sortBy, sortDir)
}

func ListUsers(ctx context.Context, page, limit, skip int, search, sortBy, sortDir string) (map[string]interface{}, error) {
	match := bson.M{"role": models.RoleCustomer}
	if search != "" {
		escaped := regexp.QuoteMeta(search)
		match["$or"] = bson.A{
			bson.M{"name": bson.M{"$regex": escaped, "$options": "i"}},
			bson.M{"email": bson.M{"$regex": escaped, "$options": "i"}},
			bson.M{"phone": bson.M{"$regex": escaped, "$options": "i"}},
		}
	}

	sort := lib.ParseSort(sortBy, sortDir, customerSortFields, "createdAt")
	total, _ := lib.Users().CountDocuments(ctx, match)

	var items []SerializedUser
	var err error
	if sortBy == "orderCount" || sortBy == "totalSpent" {
		items, err = listUsersWithOrderStats(ctx, match, skip, limit, sortBy, sort.Dir)
	} else {
		items, err = listUsersSimple(ctx, match, skip, limit, sort)
	}
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"items":      items,
		"pagination": lib.BuildPaginationMeta(page, limit, int(total)),
	}, nil
}

func listUsersSimple(ctx context.Context, match bson.M, skip, limit int, sort lib.SortParams) ([]SerializedUser, error) {
	cur, err := lib.Users().Find(ctx, match,
		options.Find().
			SetSort(bson.D{{Key: sort.Field, Value: sort.Dir}}).
			SetSkip(int64(skip)).
			SetLimit(int64(limit)),
	)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var items []SerializedUser
	for cur.Next(ctx) {
		var u models.User
		if err := cur.Decode(&u); err != nil {
			return nil, err
		}
		items = append(items, serializeUserWithStats(ctx, u))
	}
	return items, nil
}

func listUsersWithOrderStats(ctx context.Context, match bson.M, skip, limit int, sortBy string, dir int) ([]SerializedUser, error) {
	sortField := "orderCount"
	if sortBy == "totalSpent" {
		sortField = "totalSpent"
	}

	pipeline := bson.A{
		bson.M{"$match": match},
		bson.M{"$lookup": bson.M{
			"from": "orders",
			"let":  bson.M{"uid": "$_id"},
			"pipeline": bson.A{
				bson.M{"$match": bson.M{
					"$expr":         bson.M{"$eq": bson.A{"$userId", "$$uid"}},
					"paymentStatus": models.PaymentPaid,
				}},
				bson.M{"$group": bson.M{
					"_id":   nil,
					"total": bson.M{"$sum": "$total"},
					"count": bson.M{"$sum": 1},
				}},
			},
			"as": "orderStats",
		}},
		bson.M{"$addFields": bson.M{
			"orderCount": bson.M{
				"$ifNull": bson.A{bson.M{"$arrayElemAt": bson.A{"$orderStats.count", 0}}, 0},
			},
			"totalSpent": bson.M{
				"$ifNull": bson.A{bson.M{"$arrayElemAt": bson.A{"$orderStats.total", 0}}, 0},
			},
		}},
		bson.M{"$sort": bson.D{{Key: sortField, Value: dir}}},
		bson.M{"$skip": skip},
		bson.M{"$limit": limit},
	}

	cur, err := lib.Users().Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var items []SerializedUser
	for cur.Next(ctx) {
		var row struct {
			ID         primitive.ObjectID `bson:"_id"`
			Name       string             `bson:"name"`
			Email      string             `bson:"email"`
			Phone      string             `bson:"phone"`
			CreatedAt  time.Time          `bson:"createdAt"`
			OrderCount int                `bson:"orderCount"`
			TotalSpent float64            `bson:"totalSpent"`
		}
		if err := cur.Decode(&row); err != nil {
			return nil, err
		}
		items = append(items, SerializedUser{
			ID: row.ID.Hex(), Name: row.Name, Email: row.Email, Phone: row.Phone,
			CreatedAt: row.CreatedAt.Format(time.RFC3339),
			OrderCount: row.OrderCount, TotalSpent: row.TotalSpent,
		})
	}
	return items, nil
}

func serializeUserWithStats(ctx context.Context, u models.User) SerializedUser {
	orderCount, _ := lib.Orders().CountDocuments(ctx, bson.M{"userId": u.ID})
	totalSpent := userTotalSpent(ctx, u.ID)
	return SerializedUser{
		ID: u.ID.Hex(), Name: u.Name, Email: u.Email, Phone: u.Phone,
		CreatedAt: u.CreatedAt.Format(time.RFC3339), OrderCount: int(orderCount),
		TotalSpent: totalSpent,
	}
}

func GetRecentUsers(ctx context.Context, limit int64) ([]SerializedUser, error) {
	cur, err := lib.Users().Find(ctx, bson.M{"role": models.RoleCustomer},
		options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetLimit(limit))
	if err != nil {
		return []SerializedUser{}, err
	}
	defer cur.Close(ctx)
	out := make([]SerializedUser, 0, limit)
	for cur.Next(ctx) {
		var u models.User
		_ = cur.Decode(&u)
		out = append(out, serializeUserWithStats(ctx, u))
	}
	return out, nil
}

func userTotalSpent(ctx context.Context, userID interface{}) float64 {
	cur, err := lib.Orders().Aggregate(ctx, bson.A{
		bson.M{"$match": bson.M{
			"userId": userID, "paymentStatus": models.PaymentPaid,
		}},
		bson.M{"$group": bson.M{
			"_id": nil, "total": bson.M{"$sum": "$total"},
		}},
	})
	if err != nil {
		return 0
	}
	defer cur.Close(ctx)
	if !cur.Next(ctx) {
		return 0
	}
	var row bson.M
	if cur.Decode(&row) != nil {
		return 0
	}
	return num(row["total"])
}

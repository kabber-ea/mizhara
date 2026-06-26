package services

import (
	"context"
	"regexp"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"
	"go.mongodb.org/mongo-driver/bson"
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

func ListUsersForAdmin(ctx context.Context, session *lib.SessionPayload, page, limit, search string) (map[string]interface{}, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	p := lib.ParsePagination(page, limit, search)
	return ListUsers(ctx, p.Page, p.Limit, p.Skip, p.Search)
}

func ListUsers(ctx context.Context, page, limit, skip int, search string) (map[string]interface{}, error) {
	match := bson.M{"role": models.RoleCustomer}
	if search != "" {
		escaped := regexp.QuoteMeta(search)
		match["$or"] = bson.A{
			bson.M{"name": bson.M{"$regex": escaped, "$options": "i"}},
			bson.M{"email": bson.M{"$regex": escaped, "$options": "i"}},
			bson.M{"phone": bson.M{"$regex": escaped, "$options": "i"}},
		}
	}
	total, _ := lib.Users().CountDocuments(ctx, match)
	cur, err := lib.Users().Find(ctx, match,
		options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetSkip(int64(skip)).SetLimit(int64(limit)))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var items []SerializedUser
	for cur.Next(ctx) {
		var u models.User
		_ = cur.Decode(&u)
		orderCount, _ := lib.Orders().CountDocuments(ctx, bson.M{"userId": u.ID})
		totalSpent := userTotalSpent(ctx, u.ID)
		items = append(items, SerializedUser{
			ID: u.ID.Hex(), Name: u.Name, Email: u.Email, Phone: u.Phone,
			CreatedAt: u.CreatedAt.Format(time.RFC3339), OrderCount: int(orderCount),
			TotalSpent: totalSpent,
		})
	}
	return map[string]interface{}{
		"items":      items,
		"pagination": lib.BuildPaginationMeta(page, limit, int(total)),
	}, nil
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
		orderCount, _ := lib.Orders().CountDocuments(ctx, bson.M{"userId": u.ID})
		totalSpent := userTotalSpent(ctx, u.ID)
		out = append(out, SerializedUser{
			ID: u.ID.Hex(), Name: u.Name, Email: u.Email, Phone: u.Phone,
			CreatedAt: u.CreatedAt.Format(time.RFC3339),
			OrderCount: int(orderCount), TotalSpent: totalSpent,
		})
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

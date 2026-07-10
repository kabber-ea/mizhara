package services

import (
	"context"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"
	"mizhara-backend/store"
	"mizhara-backend/utils"
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
	p := utils.ParsePagination(page, limit, search)
	return ListUsers(ctx, p.Page, p.Limit, p.Skip, p.Search, sortBy, sortDir)
}

func ListUsers(ctx context.Context, page, limit, skip int, search, sortBy, sortDir string) (map[string]interface{}, error) {
	sort := utils.ParseSort(sortBy, sortDir, customerSortFields, "createdAt")
	rows, total, err := store.ListCustomers(ctx, search, skip, limit, sortBy, sort.Dir)
	if err != nil {
		return nil, err
	}
	items := make([]SerializedUser, 0, len(rows))
	for _, row := range rows {
		items = append(items, SerializedUser{
			ID: row.User.ID, Name: row.User.Name, Email: row.User.Email, Phone: row.User.Phone,
			CreatedAt: row.User.CreatedAt.Format(time.RFC3339),
			OrderCount: row.OrderCount, TotalSpent: row.TotalSpent,
		})
	}
	return map[string]interface{}{
		"items":      items,
		"pagination": utils.BuildPaginationMeta(page, limit, int(total)),
	}, nil
}

func serializeUserWithStats(ctx context.Context, u models.User) SerializedUser {
	orderCount, totalSpent, _ := store.UserOrderStats(ctx, u.ID)
	return SerializedUser{
		ID: u.ID, Name: u.Name, Email: u.Email, Phone: u.Phone,
		CreatedAt: u.CreatedAt.Format(time.RFC3339),
		OrderCount: int(orderCount), TotalSpent: totalSpent,
	}
}

func GetRecentUsers(ctx context.Context, limit int64) ([]SerializedUser, error) {
	rows, _, err := store.ListCustomers(ctx, "", 0, int(limit), "createdAt", -1)
	if err != nil {
		return []SerializedUser{}, err
	}
	out := make([]SerializedUser, 0, len(rows))
	for _, row := range rows {
		out = append(out, SerializedUser{
			ID: row.User.ID, Name: row.User.Name, Email: row.User.Email, Phone: row.User.Phone,
			CreatedAt: row.User.CreatedAt.Format(time.RFC3339),
			OrderCount: row.OrderCount, TotalSpent: row.TotalSpent,
		})
	}
	return out, nil
}

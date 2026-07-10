package store

import (
	"context"
	"sort"
	"time"

	"mizhara-backend/constants"
	"mizhara-backend/lib"
)

type RevenueDay struct {
	Date    string
	Revenue float64
	Orders  int
}

type StatusCount struct {
	Status string
	Count  int
}

type ProductSales struct {
	ProductID string
	Name      string
	Units     int
	Revenue   float64
}

type CategoryRevenue struct {
	Category string
	Revenue  float64
}

type PaidOrderKPIs struct {
	TotalRevenue  float64
	OrderCount    int
	AvgOrderValue float64
}

func PaidOrderKPIsSince(ctx context.Context, since time.Time) (PaidOrderKPIs, error) {
	var k PaidOrderKPIs
	err := lib.DB().QueryRow(ctx, `
		SELECT COALESCE(SUM(total),0), COUNT(*), COALESCE(AVG(total),0)
		FROM orders WHERE payment_status='paid' AND created_at >= $1
	`, since).Scan(&k.TotalRevenue, &k.OrderCount, &k.AvgOrderValue)
	return k, err
}

func RevenueByDaySince(ctx context.Context, since time.Time) ([]RevenueDay, error) {
	rows, err := lib.DB().Query(ctx, `
		SELECT to_char(created_at, 'YYYY-MM-DD') AS day,
			COALESCE(SUM(total),0), COUNT(*)
		FROM orders WHERE payment_status='paid' AND created_at >= $1
		GROUP BY day ORDER BY day ASC
	`, since)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []RevenueDay
	for rows.Next() {
		var r RevenueDay
		if err := rows.Scan(&r.Date, &r.Revenue, &r.Orders); err != nil {
			return nil, err
		}
		out = append(out, r)
	}
	return out, rows.Err()
}

func DeliveryStatusCountsSince(ctx context.Context, since *time.Time) ([]StatusCount, error) {
	q := `SELECT delivery_status, COUNT(*) FROM orders`
	args := []any{}
	if since != nil {
		q += ` WHERE created_at >= $1`
		args = append(args, *since)
	}
	q += ` GROUP BY delivery_status ORDER BY COUNT(*) DESC`

	rows, err := lib.DB().Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []StatusCount
	for rows.Next() {
		var s StatusCount
		if err := rows.Scan(&s.Status, &s.Count); err != nil {
			return nil, err
		}
		out = append(out, s)
	}
	return out, rows.Err()
}

func TopProductsSince(ctx context.Context, since *time.Time, limit int) ([]ProductSales, error) {
	q := `
		SELECT elem->>'productId' AS pid,
			COALESCE(MAX(elem->>'name'), 'Unknown product') AS name,
			COALESCE(SUM((elem->>'quantity')::int), 0) AS units,
			COALESCE(SUM((elem->>'price')::float * (elem->>'quantity')::int), 0) AS revenue
		FROM orders o, jsonb_array_elements(o.items) elem
		WHERE o.payment_status='paid'
	`
	args := []any{}
	if since != nil {
		q += ` AND o.created_at >= $1`
		args = append(args, *since)
	}
	q += ` GROUP BY pid ORDER BY units DESC LIMIT ` + itoa(limit)

	rows, err := lib.DB().Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []ProductSales
	for rows.Next() {
		var p ProductSales
		if err := rows.Scan(&p.ProductID, &p.Name, &p.Units, &p.Revenue); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

func TopCategoriesSince(ctx context.Context, since time.Time) ([]CategoryRevenue, error) {
	rows, err := lib.DB().Query(ctx, `
		SELECT COALESCE(NULLIF(elem->>'category',''), 'Uncategorized') AS cat,
			COALESCE(SUM((elem->>'price')::float * (elem->>'quantity')::int), 0) AS revenue
		FROM orders o, jsonb_array_elements(o.items) elem
		WHERE o.payment_status='paid' AND o.created_at >= $1
		GROUP BY cat
	`, since)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	revenueByCategory := map[string]float64{}
	for rows.Next() {
		var cat string
		var rev float64
		if err := rows.Scan(&cat, &rev); err != nil {
			return nil, err
		}
		revenueByCategory[cat] = rev
	}

	cats, err := ListCategories(ctx, false)
	if err != nil {
		return nil, err
	}

	type entry struct {
		name    string
		revenue float64
	}
	entries := make([]entry, 0, len(cats))
	for _, c := range cats {
		if c.Name == "" {
			continue
		}
		entries = append(entries, entry{name: c.Name, revenue: revenueByCategory[c.Name]})
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
	out := make([]CategoryRevenue, len(entries))
	for i, e := range entries {
		out[i] = CategoryRevenue{Category: e.name, Revenue: e.revenue}
	}
	return out, nil
}

func UserTotalSpent(ctx context.Context, userID string) (float64, error) {
	var total float64
	err := lib.DB().QueryRow(ctx, `
		SELECT COALESCE(SUM(total),0) FROM orders WHERE user_id=$1 AND payment_status='paid'
	`, userID).Scan(&total)
	return total, err
}

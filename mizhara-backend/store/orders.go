package store

import (
	"context"
	"fmt"
	"strings"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"

	"github.com/jackc/pgx/v5"
)

const orderColsPlain = `id, user_id, order_number, items, shipping_address,
	subtotal, discount_amount, offer_id, offer_name, shipping, total, currency,
	payment_status, delivery_status, tracking_provider, tracking_number, tracking_url,
	shipped_at, delivered_at, razorpay_order_id, razorpay_payment_id, created_at, updated_at`

const orderCols = `o.id, o.user_id, o.order_number, o.items, o.shipping_address,
	o.subtotal, o.discount_amount, o.offer_id, o.offer_name, o.shipping, o.total, o.currency,
	o.payment_status, o.delivery_status, o.tracking_provider, o.tracking_number, o.tracking_url,
	o.shipped_at, o.delivered_at, o.razorpay_order_id, o.razorpay_payment_id, o.created_at, o.updated_at`

type OrderWithUser struct {
	Order        models.Order
	CustomerName string
	CustomerEmail string
	CustomerPhone string
}

func scanOrder(row pgx.Row) (*models.Order, error) {
	var o models.Order
	var itemsJSON, shipJSON []byte
	var shippedAt, deliveredAt *time.Time
	err := row.Scan(
		&o.ID, &o.UserID, &o.OrderNumber, &itemsJSON, &shipJSON,
		&o.Subtotal, &o.DiscountAmount, &o.OfferID, &o.OfferName, &o.Shipping, &o.Total, &o.Currency,
		&o.PaymentStatus, &o.DeliveryStatus, &o.TrackingProvider, &o.TrackingNumber, &o.TrackingURL,
		&shippedAt, &deliveredAt, &o.RazorpayOrderID, &o.RazorpayPaymentID, &o.CreatedAt, &o.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	o.ShippedAt = shippedAt
	o.DeliveredAt = deliveredAt
	_ = scanJSON(itemsJSON, &o.Items)
	_ = scanJSON(shipJSON, &o.ShippingAddress)
	return &o, nil
}

func scanOrderWithUser(row pgx.Row) (*OrderWithUser, error) {
	var ow OrderWithUser
	var itemsJSON, shipJSON []byte
	var shippedAt, deliveredAt *time.Time
	err := row.Scan(
		&ow.Order.ID, &ow.Order.UserID, &ow.Order.OrderNumber, &itemsJSON, &shipJSON,
		&ow.Order.Subtotal, &ow.Order.DiscountAmount, &ow.Order.OfferID, &ow.Order.OfferName,
		&ow.Order.Shipping, &ow.Order.Total, &ow.Order.Currency,
		&ow.Order.PaymentStatus, &ow.Order.DeliveryStatus, &ow.Order.TrackingProvider,
		&ow.Order.TrackingNumber, &ow.Order.TrackingURL,
		&shippedAt, &deliveredAt, &ow.Order.RazorpayOrderID, &ow.Order.RazorpayPaymentID,
		&ow.Order.CreatedAt, &ow.Order.UpdatedAt,
		&ow.CustomerName, &ow.CustomerEmail, &ow.CustomerPhone,
	)
	if err != nil {
		return nil, err
	}
	ow.Order.ShippedAt = shippedAt
	ow.Order.DeliveredAt = deliveredAt
	_ = scanJSON(itemsJSON, &ow.Order.Items)
	_ = scanJSON(shipJSON, &ow.Order.ShippingAddress)
	return &ow, nil
}

func InsertOrder(ctx context.Context, o *models.Order) error {
	items, _ := marshalJSON(o.Items)
	ship, _ := marshalJSON(o.ShippingAddress)
	_, err := lib.DB().Exec(ctx, `
		INSERT INTO orders (id, user_id, order_number, items, shipping_address, subtotal, discount_amount,
			offer_id, offer_name, shipping, total, currency, payment_status, delivery_status,
			tracking_provider, tracking_number, tracking_url, shipped_at, delivered_at,
			razorpay_order_id, razorpay_payment_id, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
	`, o.ID, o.UserID, o.OrderNumber, items, ship, o.Subtotal, o.DiscountAmount,
		o.OfferID, o.OfferName, o.Shipping, o.Total, o.Currency, o.PaymentStatus, o.DeliveryStatus,
		o.TrackingProvider, o.TrackingNumber, o.TrackingURL, o.ShippedAt, o.DeliveredAt,
		o.RazorpayOrderID, o.RazorpayPaymentID, o.CreatedAt, o.UpdatedAt)
	return err
}

func UpdateOrder(ctx context.Context, o *models.Order) error {
	items, _ := marshalJSON(o.Items)
	ship, _ := marshalJSON(o.ShippingAddress)
	tag, err := lib.DB().Exec(ctx, `
		UPDATE orders SET user_id=$2, order_number=$3, items=$4, shipping_address=$5,
			subtotal=$6, discount_amount=$7, offer_id=$8, offer_name=$9, shipping=$10, total=$11,
			currency=$12, payment_status=$13, delivery_status=$14, tracking_provider=$15,
			tracking_number=$16, tracking_url=$17, shipped_at=$18, delivered_at=$19,
			razorpay_order_id=$20, razorpay_payment_id=$21, updated_at=$22
		WHERE id=$1
	`, o.ID, o.UserID, o.OrderNumber, items, ship, o.Subtotal, o.DiscountAmount,
		o.OfferID, o.OfferName, o.Shipping, o.Total, o.Currency, o.PaymentStatus, o.DeliveryStatus,
		o.TrackingProvider, o.TrackingNumber, o.TrackingURL, o.ShippedAt, o.DeliveredAt,
		o.RazorpayOrderID, o.RazorpayPaymentID, o.UpdatedAt)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

func UpdateOrderRazorpayID(ctx context.Context, id, rzpID string) error {
	_, err := lib.DB().Exec(ctx, `UPDATE orders SET razorpay_order_id=$2, updated_at=$3 WHERE id=$1`,
		id, rzpID, time.Now())
	return err
}

func FindOrderByID(ctx context.Context, id string) (*models.Order, error) {
	row := lib.DB().QueryRow(ctx, `SELECT `+orderCols+` FROM orders o WHERE o.id=$1`, id)
	o, err := scanOrder(row)
	if isNoRows(err) {
		return nil, nil
	}
	return o, err
}

func FindOrderWithUserByID(ctx context.Context, id string) (*OrderWithUser, error) {
	row := lib.DB().QueryRow(ctx, `
		SELECT `+orderCols+`, COALESCE(u.name,''), COALESCE(u.email,''), COALESCE(u.phone,'')
		FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE o.id=$1
	`, id)
	ow, err := scanOrderWithUser(row)
	if isNoRows(err) {
		return nil, nil
	}
	return ow, err
}

func ListOrdersByUser(ctx context.Context, userID string) ([]models.Order, error) {
	rows, err := lib.DB().Query(ctx, `SELECT `+orderCols+` FROM orders o WHERE o.user_id=$1 ORDER BY o.created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Order
	for rows.Next() {
		o, err := scanOrder(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, *o)
	}
	return out, rows.Err()
}

type OrderListParams struct {
	Skip, Limit       int
	Search            string
	DeliveryStatus    string
	PaymentStatus     string
	SortField         string
	SortDir           int
	CreatedAfter      *time.Time
}

func ListOrdersWithUser(ctx context.Context, p OrderListParams) ([]OrderWithUser, int64, error) {
	where, args := orderListWhere(p)
	countQ := `
		SELECT COUNT(*) FROM orders o
		LEFT JOIN users u ON u.id = o.user_id
		WHERE ` + where
	var total int64
	if err := lib.DB().QueryRow(ctx, countQ, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortSQL := orderSortSQL(p.SortField, p.SortDir)
	argN := len(args) + 1
	q := `
		SELECT ` + orderCols + `, COALESCE(u.name,''), COALESCE(u.email,''), COALESCE(u.phone,'')
		FROM orders o LEFT JOIN users u ON u.id = o.user_id
		WHERE ` + where + ` ORDER BY ` + sortSQL +
		fmt.Sprintf(` OFFSET $%d LIMIT $%d`, argN, argN+1)
	args = append(args, p.Skip, p.Limit)

	rows, err := lib.DB().Query(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var out []OrderWithUser
	for rows.Next() {
		ow, err := scanOrderWithUser(rows)
		if err != nil {
			return nil, 0, err
		}
		out = append(out, *ow)
	}
	return out, total, rows.Err()
}

func orderListWhere(p OrderListParams) (string, []any) {
	parts := []string{"1=1"}
	args := []any{}
	n := 1
	if p.CreatedAfter != nil {
		parts = append(parts, fmt.Sprintf(`o.created_at >= $%d`, n))
		args = append(args, *p.CreatedAfter)
		n++
	}
	if p.DeliveryStatus != "" && p.DeliveryStatus != "all" {
		parts = append(parts, fmt.Sprintf(`o.delivery_status = $%d`, n))
		args = append(args, p.DeliveryStatus)
		n++
	}
	if p.PaymentStatus != "" && p.PaymentStatus != "all" {
		parts = append(parts, fmt.Sprintf(`o.payment_status = $%d`, n))
		args = append(args, p.PaymentStatus)
		n++
	}
	if p.Search != "" {
		parts = append(parts, fmt.Sprintf(`(
			o.order_number ILIKE $%d OR u.name ILIKE $%d OR u.email ILIKE $%d OR
			o.shipping_address->>'name' ILIKE $%d OR o.shipping_address->>'phone' ILIKE $%d
		)`, n, n, n, n, n))
		args = append(args, "%"+p.Search+"%")
		n++
	}
	return strings.Join(parts, " AND "), args
}

func orderSortSQL(field string, dir int) string {
	dirSQL := "DESC"
	if dir > 0 {
		dirSQL = "ASC"
	}
	switch field {
	case "orderNumber":
		return "o.order_number " + dirSQL
	case "customerName":
		return "u.name " + dirSQL
	case "itemCount":
		return `(
			SELECT COALESCE(SUM((elem->>'quantity')::int),0) FROM jsonb_array_elements(o.items) elem
		) ` + dirSQL
	case "total":
		return "o.total " + dirSQL
	case "deliveryStatus":
		return "o.delivery_status " + dirSQL
	default:
		return "o.created_at " + dirSQL
	}
}

func CountPendingShipments(ctx context.Context, since time.Time) (int64, error) {
	var n int64
	err := lib.DB().QueryRow(ctx, `
		SELECT COUNT(*) FROM orders
		WHERE payment_status='paid' AND created_at >= $1
		AND delivery_status IN ('processing','shipped')
	`, since).Scan(&n)
	return n, err
}

func CountOrdersByUser(ctx context.Context, userID string) (int64, error) {
	var n int64
	err := lib.DB().QueryRow(ctx, `SELECT COUNT(*) FROM orders WHERE user_id=$1`, userID).Scan(&n)
	return n, err
}

// VerifyAndPayOrder marks order paid and deducts stock atomically.
func VerifyAndPayOrder(ctx context.Context, userID, rzpOrderID, rzpPaymentID string) (*models.Order, error) {
	tx, err := lib.DB().Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	row := tx.QueryRow(ctx, `
		UPDATE orders SET payment_status='paid', razorpay_payment_id=$3, updated_at=$4
		WHERE razorpay_order_id=$1 AND user_id=$2 AND payment_status='pending'
		RETURNING `+orderColsPlain,
		rzpOrderID, userID, rzpPaymentID, time.Now())

	o, err := scanOrder(row)
	if isNoRows(err) {
		row2 := tx.QueryRow(ctx, `
			SELECT `+orderColsPlain+`
			FROM orders WHERE razorpay_order_id=$1 AND user_id=$2 AND payment_status='paid'
		`, rzpOrderID, userID)
		o2, err2 := scanOrder(row2)
		if isNoRows(err2) {
			return nil, pgx.ErrNoRows
		}
		if err2 != nil {
			return nil, err2
		}
		if err := tx.Commit(ctx); err != nil {
			return nil, err
		}
		return o2, nil
	}
	if err != nil {
		return nil, err
	}

	now := time.Now()
	for _, item := range o.Items {
		if item.ProductID == "" || item.Quantity <= 0 {
			continue
		}
		tag, err := tx.Exec(ctx, `
			UPDATE products SET stock_quantity = stock_quantity - $2,
				in_stock = (stock_quantity - $2) > 0, updated_at = $3
			WHERE id = $1 AND stock_quantity >= $2
		`, item.ProductID, item.Quantity, now)
		if err != nil {
			return nil, err
		}
		if tag.RowsAffected() == 0 {
			return nil, fmt.Errorf("insufficient stock")
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return o, nil
}

package services

import (
	"context"
	"strings"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"
	"mizhara-backend/store"
	"mizhara-backend/utils"
)

type OrderListParams struct {
	Page, Limit, Skip int
	Search            string
	DeliveryStatus    string
	PaymentStatus     string
	SortBy            string
	SortDir           string
	CreatedAfter      *time.Time
}

var orderSortFields = map[string]string{
	"createdAt":      "createdAt",
	"orderNumber":    "orderNumber",
	"customerName":   "customerName",
	"itemCount":      "itemCount",
	"total":          "total",
	"deliveryStatus": "deliveryStatus",
}

type SerializedOrder struct {
	ID               string                 `json:"id"`
	OrderNumber      string                 `json:"orderNumber"`
	UserID           string                 `json:"userId"`
	CustomerName     string                 `json:"customerName"`
	CustomerEmail    string                 `json:"customerEmail,omitempty"`
	CustomerPhone    string                 `json:"customerPhone,omitempty"`
	Items            []models.OrderItem     `json:"items"`
	ItemCount        int                    `json:"itemCount"`
	ShippingAddress  models.ShippingAddress `json:"shippingAddress"`
	Subtotal         float64                `json:"subtotal"`
	Shipping         float64                `json:"shipping"`
	Total            float64                `json:"total"`
	Currency         string                 `json:"currency"`
	PaymentStatus    string                 `json:"paymentStatus"`
	DeliveryStatus   string                 `json:"deliveryStatus"`
	TrackingProvider string                 `json:"trackingProvider,omitempty"`
	TrackingNumber   string                 `json:"trackingNumber,omitempty"`
	TrackingURL      string                 `json:"trackingUrl,omitempty"`
	ShippedAt        string                 `json:"shippedAt,omitempty"`
	DeliveredAt      string                 `json:"deliveredAt,omitempty"`
	CreatedAt        string                 `json:"createdAt"`
	UpdatedAt        string                 `json:"updatedAt"`
}

type FulfillmentUpdate struct {
	DeliveryStatus   models.DeliveryStatus  `json:"deliveryStatus"`
	TrackingProvider utils.TrackingProvider `json:"trackingProvider"`
	TrackingNumber   string                 `json:"trackingNumber"`
	TrackingURL      string                 `json:"trackingUrl"`
}

func sumOrderItemQuantities(items []models.OrderItem) int {
	total := 0
	for _, item := range items {
		total += item.Quantity
	}
	return total
}

func serializeOrderRow(ow store.OrderWithUser) SerializedOrder {
	o := ow.Order
	name := ow.CustomerName
	if name == "" {
		name = o.ShippingAddress.Name
	}
	email := ow.CustomerEmail
	if email == "" {
		email = o.ShippingAddress.Email
	}
	phone := ow.CustomerPhone
	if phone == "" {
		phone = o.ShippingAddress.Phone
	}
	out := SerializedOrder{
		ID: o.ID, OrderNumber: o.OrderNumber, UserID: o.UserID,
		CustomerName: name, CustomerEmail: email, CustomerPhone: phone,
		Items: o.Items, ItemCount: sumOrderItemQuantities(o.Items),
		ShippingAddress: o.ShippingAddress,
		Subtotal: o.Subtotal, Shipping: o.Shipping, Total: o.Total, Currency: o.Currency,
		PaymentStatus: string(o.PaymentStatus), DeliveryStatus: string(o.DeliveryStatus),
		TrackingProvider: string(o.TrackingProvider), TrackingNumber: o.TrackingNumber,
		TrackingURL: o.TrackingURL,
		CreatedAt: o.CreatedAt.Format(time.RFC3339), UpdatedAt: o.UpdatedAt.Format(time.RFC3339),
	}
	if out.DeliveryStatus != string(models.DeliveryShipped) && out.DeliveryStatus != string(models.DeliveryDelivered) {
		out.TrackingProvider = ""
		out.TrackingNumber = ""
		out.TrackingURL = ""
	}
	if o.ShippedAt != nil {
		out.ShippedAt = o.ShippedAt.Format(time.RFC3339)
	}
	if o.DeliveredAt != nil {
		out.DeliveredAt = o.DeliveredAt.Format(time.RFC3339)
	}
	return out
}

func ListOrdersForAdmin(ctx context.Context, session *lib.SessionPayload, page, limit, search, deliveryStatus, paymentStatus, sortBy, sortDir string) (map[string]interface{}, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	p := utils.ParsePagination(page, limit, search)
	return ListOrders(ctx, OrderListParams{
		Page: p.Page, Limit: p.Limit, Skip: p.Skip, Search: p.Search,
		DeliveryStatus: deliveryStatus, PaymentStatus: paymentStatus,
		SortBy: sortBy, SortDir: sortDir,
	})
}

func GetOrderByIDForAdmin(ctx context.Context, session *lib.SessionPayload, id string) (*SerializedOrder, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	order, err := GetOrderByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, utils.ErrNotFound
	}
	return order, nil
}

func UpdateOrderFulfillmentForAdmin(ctx context.Context, session *lib.SessionPayload, id string, body FulfillmentUpdate) (*SerializedOrder, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	order, err := UpdateOrderFulfillment(ctx, id, body)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, utils.ErrNotFound
	}
	return order, nil
}

func ListOrders(ctx context.Context, params OrderListParams) (map[string]interface{}, error) {
	sort := utils.ParseSort(params.SortBy, params.SortDir, orderSortFields, "createdAt")
	rows, total, err := store.ListOrdersWithUser(ctx, store.OrderListParams{
		Skip: params.Skip, Limit: params.Limit, Search: params.Search,
		DeliveryStatus: params.DeliveryStatus, PaymentStatus: params.PaymentStatus,
		SortField: sort.Field, SortDir: sort.Dir, CreatedAfter: params.CreatedAfter,
	})
	if err != nil {
		return nil, err
	}
	items := make([]SerializedOrder, 0, len(rows))
	for _, row := range rows {
		items = append(items, serializeOrderRow(row))
	}
	return map[string]interface{}{
		"items":      items,
		"pagination": utils.BuildPaginationMeta(params.Page, params.Limit, int(total)),
	}, nil
}

func GetOrderByID(ctx context.Context, id string) (*SerializedOrder, error) {
	if !lib.ValidID(id) {
		return nil, nil
	}
	ow, err := store.FindOrderWithUserByID(ctx, id)
	if err != nil || ow == nil {
		return nil, err
	}
	o := serializeOrderRow(*ow)
	return &o, nil
}

func UpdateOrderFulfillment(ctx context.Context, id string, body FulfillmentUpdate) (*SerializedOrder, error) {
	if !lib.ValidID(id) {
		return nil, nil
	}
	order, err := store.FindOrderByID(ctx, id)
	if err != nil || order == nil {
		return nil, err
	}
	if body.DeliveryStatus != "" {
		order.DeliveryStatus = body.DeliveryStatus
		if body.DeliveryStatus == models.DeliveryShipped && order.ShippedAt == nil {
			now := time.Now()
			order.ShippedAt = &now
		}
		if body.DeliveryStatus == models.DeliveryDelivered {
			now := time.Now()
			order.DeliveredAt = &now
		}
		if body.DeliveryStatus == models.DeliveryProcessing {
			order.TrackingProvider = ""
			order.TrackingNumber = ""
			order.TrackingURL = ""
			order.ShippedAt = nil
		}
	}

	if order.DeliveryStatus == models.DeliveryShipped {
		trackingNumber := strings.TrimSpace(body.TrackingNumber)
		if trackingNumber == "" {
			return nil, utils.BadRequest("tracking number is required for shipped orders")
		}
		if body.TrackingProvider == "" {
			return nil, utils.BadRequest("courier is required for shipped orders")
		}
		provider := utils.TrackingProvider(body.TrackingProvider)
		trackingURL := utils.BuildTrackingURL(provider, trackingNumber, body.TrackingURL)
		if trackingURL == "" {
			return nil, utils.BadRequest("tracking URL is required for shipped orders")
		}
		order.TrackingProvider = models.TrackingProvider(provider)
		order.TrackingNumber = trackingNumber
		order.TrackingURL = trackingURL
	}
	order.UpdatedAt = time.Now()
	if err := store.UpdateOrder(ctx, order); err != nil {
		return nil, err
	}
	return GetOrderByID(ctx, id)
}

package services

import (
	"context"
	"errors"
	"regexp"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type OrderListParams struct {
	Page, Limit, Skip int
	Search            string
	DeliveryStatus    string
	PaymentStatus     string
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
	DeliveryStatus   models.DeliveryStatus   `json:"deliveryStatus"`
	TrackingProvider lib.TrackingProvider    `json:"trackingProvider"`
	TrackingNumber   string                  `json:"trackingNumber"`
	TrackingURL      string                  `json:"trackingUrl"`
}

func serializeOrder(doc bson.M) SerializedOrder {
	items, _ := doc["items"].(primitive.A)
	orderItems := make([]models.OrderItem, 0)
	itemCount := 0
	for _, raw := range items {
		m, ok := raw.(bson.M)
		if !ok || m == nil {
			continue
		}
		qty := intNum(m["quantity"])
		itemCount += qty
		orderItems = append(orderItems, models.OrderItem{
			ProductID: str(m["productId"]), Name: str(m["name"]), Price: num(m["price"]),
			Quantity: qty, Size: str(m["size"]), Image: str(m["image"]), Category: str(m["category"]),
		})
	}
	user, _ := doc["user"].(bson.M)
	shipping, _ := doc["shippingAddress"].(bson.M)
	name := str(user["name"])
	if name == "" {
		name = str(shipping["name"])
	}
	o := SerializedOrder{
		ID: str(doc["_id"]), OrderNumber: str(doc["orderNumber"]), UserID: str(doc["userId"]),
		CustomerName: name, CustomerEmail: str(user["email"]),
		CustomerPhone: str(user["phone"]), Items: orderItems, ItemCount: itemCount,
		Subtotal: num(doc["subtotal"]), Shipping: num(doc["shipping"]), Total: num(doc["total"]),
		Currency: str(doc["currency"]), PaymentStatus: str(doc["paymentStatus"]),
		DeliveryStatus: str(doc["deliveryStatus"]),
		TrackingProvider: str(doc["trackingProvider"]), TrackingNumber: str(doc["trackingNumber"]),
		TrackingURL: str(doc["trackingUrl"]),
	}
	if t, ok := doc["createdAt"].(primitive.DateTime); ok {
		o.CreatedAt = t.Time().Format(time.RFC3339)
	}
	if t, ok := doc["updatedAt"].(primitive.DateTime); ok {
		o.UpdatedAt = t.Time().Format(time.RFC3339)
	}
	if sa, ok := shipping["address"]; ok {
		o.ShippingAddress = models.ShippingAddress{
			Name: str(shipping["name"]), Email: str(shipping["email"]), Phone: str(shipping["phone"]),
			Address: str(sa), City: str(shipping["city"]), State: str(shipping["state"]), Pincode: str(shipping["pincode"]),
		}
	}
	return o
}

func intNum(v interface{}) int {
	switch t := v.(type) {
	case int32:
		return int(t)
	case int64:
		return int(t)
	case int:
		return t
	case float64:
		return int(t)
	default:
		return 0
	}
}

func str(v interface{}) string {
	if v == nil {
		return ""
	}
	switch t := v.(type) {
	case string:
		return t
	case primitive.ObjectID:
		return t.Hex()
	default:
		return ""
	}
}

func num(v interface{}) float64 {
	switch t := v.(type) {
	case float64:
		return t
	case int32:
		return float64(t)
	case int64:
		return float64(t)
	default:
		return 0
	}
}

func ListOrdersForAdmin(ctx context.Context, session *lib.SessionPayload, page, limit, search, deliveryStatus, paymentStatus string) (map[string]interface{}, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	p := lib.ParsePagination(page, limit, search)
	return ListOrders(ctx, OrderListParams{
		Page: p.Page, Limit: p.Limit, Skip: p.Skip, Search: p.Search,
		DeliveryStatus: deliveryStatus, PaymentStatus: paymentStatus,
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
		return nil, lib.ErrNotFound
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
		return nil, lib.ErrNotFound
	}
	return order, nil
}

func ListOrders(ctx context.Context, params OrderListParams) (map[string]interface{}, error) {
	match := orderListMatch(params)

	pipeline := orderListLookupPipeline(match, params.Search)
	pipeline = append(pipeline,
		bson.D{{Key: "$sort", Value: bson.M{"createdAt": -1}}},
		bson.D{{Key: "$skip", Value: params.Skip}},
		bson.D{{Key: "$limit", Value: params.Limit}},
	)

	cur, err := lib.Orders().Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var items []SerializedOrder
	for cur.Next(ctx) {
		var doc bson.M
		_ = cur.Decode(&doc)
		items = append(items, serializeOrder(doc))
	}

	total, err := countOrders(ctx, params)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{
		"items":      items,
		"pagination": lib.BuildPaginationMeta(params.Page, params.Limit, int(total)),
	}, nil
}

func orderListMatch(params OrderListParams) bson.M {
	match := bson.M{}
	if params.DeliveryStatus != "" && params.DeliveryStatus != "all" {
		match["deliveryStatus"] = params.DeliveryStatus
	}
	if params.PaymentStatus != "" && params.PaymentStatus != "all" {
		match["paymentStatus"] = params.PaymentStatus
	}
	return match
}

func orderListLookupPipeline(match bson.M, search string) mongo.Pipeline {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: match}},
		{{Key: "$lookup", Value: bson.M{"from": "users", "localField": "userId", "foreignField": "_id", "as": "user"}}},
		{{Key: "$unwind", Value: bson.M{"path": "$user", "preserveNullAndEmptyArrays": true}}},
	}
	if search != "" {
		escaped := regexp.QuoteMeta(search)
		pipeline = append(pipeline, bson.D{{Key: "$match", Value: bson.M{
			"$or": bson.A{
				bson.M{"orderNumber": bson.M{"$regex": escaped, "$options": "i"}},
				bson.M{"user.name": bson.M{"$regex": escaped, "$options": "i"}},
				bson.M{"user.email": bson.M{"$regex": escaped, "$options": "i"}},
			},
		}}})
	}
	return pipeline
}

func countOrders(ctx context.Context, params OrderListParams) (int64, error) {
	match := orderListMatch(params)
	if params.Search == "" {
		return lib.Orders().CountDocuments(ctx, match)
	}
	pipeline := orderListLookupPipeline(match, params.Search)
	pipeline = append(pipeline, bson.D{{Key: "$count", Value: "total"}})
	cur, err := lib.Orders().Aggregate(ctx, pipeline)
	if err != nil {
		return 0, err
	}
	defer cur.Close(ctx)
	if !cur.Next(ctx) {
		return 0, nil
	}
	var result struct {
		Total int64 `bson:"total"`
	}
	if err := cur.Decode(&result); err != nil {
		return 0, err
	}
	return result.Total, nil
}

func GetOrderByID(ctx context.Context, id string) (*SerializedOrder, error) {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, nil
	}
	cur, err := lib.Orders().Aggregate(ctx, mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"_id": oid}}},
		{{Key: "$lookup", Value: bson.M{"from": "users", "localField": "userId", "foreignField": "_id", "as": "user"}}},
		{{Key: "$unwind", Value: bson.M{"path": "$user", "preserveNullAndEmptyArrays": true}}},
	})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	if !cur.Next(ctx) {
		return nil, nil
	}
	var doc bson.M
	_ = cur.Decode(&doc)
	o := serializeOrder(doc)
	return &o, nil
}

func UpdateOrderFulfillment(ctx context.Context, id string, body FulfillmentUpdate) (*SerializedOrder, error) {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, nil
	}
	var order models.Order
	err = lib.Orders().FindOne(ctx, bson.M{"_id": oid}).Decode(&order)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, nil
	}
	if err != nil {
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
	}
	if body.TrackingProvider != "" {
		order.TrackingProvider = models.TrackingProvider(body.TrackingProvider)
	}
	if body.TrackingNumber != "" {
		order.TrackingNumber = body.TrackingNumber
	}
	if body.TrackingProvider != "" && body.TrackingNumber != "" {
		order.TrackingURL = lib.BuildTrackingURL(body.TrackingProvider, body.TrackingNumber, body.TrackingURL)
	} else if body.TrackingURL != "" {
		order.TrackingURL = body.TrackingURL
	}
	order.UpdatedAt = time.Now()
	_, err = lib.Orders().ReplaceOne(ctx, bson.M{"_id": oid}, order)
	if err != nil {
		return nil, err
	}
	return GetOrderByID(ctx, id)
}

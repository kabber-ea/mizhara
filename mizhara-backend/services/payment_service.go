package services

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math"
	"math/rand"
	"os"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PaymentVerifyInput struct {
	RazorpayOrderID   string `json:"razorpayOrderId"`
	RazorpayPaymentID string `json:"razorpayPaymentId"`
	RazorpaySignature string `json:"razorpaySignature"`
}

func CreatePaymentForSession(ctx context.Context, session *lib.SessionPayload, input PaymentCreateInput) (map[string]interface{}, error) {
	if err := RequireCustomer(session); err != nil {
		return nil, err
	}
	return CreatePaymentOrder(ctx, session.UserID, input)
}

func VerifyPaymentForSession(ctx context.Context, session *lib.SessionPayload, input PaymentVerifyInput) (map[string]string, error) {
	if err := RequireCustomer(session); err != nil {
		return nil, err
	}
	return VerifyPayment(ctx, session.UserID, input.RazorpayOrderID, input.RazorpayPaymentID, input.RazorpaySignature)
}

func generateOrderNumber() string {
	return fmt.Sprintf("MIZ-%d%d", time.Now().Unix()%1000000, rand.Intn(90)+10)
}

type PaymentCreateInput struct {
	Items           []models.OrderItem     `json:"items"`
	ShippingAddress models.ShippingAddress `json:"shippingAddress"`
	Subtotal        float64                `json:"subtotal"`
	Total           float64                `json:"total"`
	DiscountAmount  float64                `json:"discountAmount"`
	OfferID         string                 `json:"offerId"`
	OfferCode       string                 `json:"offerCode"`
}

func CreatePaymentOrder(ctx context.Context, userID string, input PaymentCreateInput) (map[string]interface{}, error) {
	uid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}

	stockItems := make([]struct {
		ProductID string
		Quantity  int
		Name      string
	}, len(input.Items))
	for i, item := range input.Items {
		stockItems[i] = struct {
			ProductID string
			Quantity  int
			Name      string
		}{ProductID: item.ProductID, Quantity: item.Quantity, Name: item.Name}
	}
	if err := ValidateOrderStock(ctx, stockItems); err != nil {
		return nil, err
	}

	cartLines := make([]CartLineInput, len(input.Items))
	for i, item := range input.Items {
		cartLines[i] = CartLineInput{ProductID: item.ProductID, Quantity: item.Quantity}
	}
	orderItems, subtotal, discount, total, offerID, offerName, err := ResolveOrderPricing(ctx, cartLines, input.OfferID, input.OfferCode)
	if err != nil {
		return nil, err
	}
	if input.Total > 0 && math.Abs(total-input.Total) > 0.02 {
		return nil, lib.BadRequest("order total changed — please refresh your bag")
	}

	orderNumber := generateOrderNumber()
	now := time.Now()

	order := models.Order{
		ID: primitive.NewObjectID(), UserID: uid, OrderNumber: orderNumber,
		Items: orderItems, ShippingAddress: input.ShippingAddress,
		Subtotal: subtotal, DiscountAmount: discount, OfferID: offerID, OfferName: offerName,
		Shipping: 0, Total: total, Currency: "INR",
		PaymentStatus: models.PaymentPending, DeliveryStatus: models.DeliveryProcessing,
		CreatedAt: now, UpdatedAt: now,
	}
	_, err = lib.Orders().InsertOne(ctx, order)
	if err != nil {
		return nil, err
	}

	rzp, err := lib.NewRazorpayClient()
	if err != nil {
		return nil, err
	}
	amount := lib.ToPaise(total)
	rzpOrder, err := rzp.Order.Create(map[string]interface{}{
		"amount": amount, "currency": "INR", "receipt": orderNumber,
		"notes": map[string]string{"orderId": order.ID.Hex()},
	}, nil)
	if err != nil {
		return nil, err
	}
	rzpID, ok := rzpOrder["id"].(string)
	if !ok || rzpID == "" {
		return nil, lib.BadRequest("failed to create payment order")
	}
	_, err = lib.Orders().UpdateOne(ctx, bson.M{"_id": order.ID}, bson.M{"$set": bson.M{"razorpayOrderId": rzpID, "updatedAt": time.Now()}})
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"orderId": order.ID.Hex(), "orderNumber": orderNumber,
		"razorpayOrderId": rzpID, "amount": amount, "currency": "INR",
		"key": lib.RazorpayPublicKey(),
	}, nil
}

func VerifyPayment(ctx context.Context, userID string, rzpOrderID, rzpPaymentID, signature string) (map[string]string, error) {
	secret := os.Getenv("RAZORPAY_KEY_SECRET")
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(rzpOrderID + "|" + rzpPaymentID))
	expected := hex.EncodeToString(mac.Sum(nil))
	if expected != signature {
		return nil, lib.BadRequest("invalid payment signature")
	}

	uid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, lib.BadRequest("invalid user")
	}
	var order models.Order
	err = lib.Orders().FindOneAndUpdate(ctx,
		bson.M{"razorpayOrderId": rzpOrderID, "userId": uid},
		bson.M{"$set": bson.M{"paymentStatus": models.PaymentPaid, "razorpayPaymentId": rzpPaymentID, "updatedAt": time.Now()}},
	).Decode(&order)
	if err != nil {
		return nil, lib.ErrNotFound
	}

	deductItems := make([]struct {
		ProductID string
		Quantity  int
	}, len(order.Items))
	for i, item := range order.Items {
		deductItems[i] = struct {
			ProductID string
			Quantity  int
		}{ProductID: item.ProductID, Quantity: item.Quantity}
	}
	_ = DeductStockForOrder(ctx, deductItems)

	return map[string]string{"orderNumber": order.OrderNumber}, nil
}

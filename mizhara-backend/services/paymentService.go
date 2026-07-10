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
	"mizhara-backend/store"
	"mizhara-backend/utils"

	"github.com/jackc/pgx/v5"
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
	if !lib.ValidID(userID) {
		return nil, utils.BadRequest("invalid user")
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
		return nil, utils.BadRequest("order total changed — please refresh your bag")
	}

	orderNumber := generateOrderNumber()
	now := time.Now()

	order := models.Order{
		ID: lib.NewID(), UserID: userID, OrderNumber: orderNumber,
		Items: orderItems, ShippingAddress: input.ShippingAddress,
		Subtotal: subtotal, DiscountAmount: discount, OfferID: offerID, OfferName: offerName,
		Shipping: 0, Total: total, Currency: "INR",
		PaymentStatus: models.PaymentPending, DeliveryStatus: models.DeliveryProcessing,
		CreatedAt: now, UpdatedAt: now,
	}
	if err := store.InsertOrder(ctx, &order); err != nil {
		return nil, err
	}

	rzp, err := lib.NewRazorpayClient()
	if err != nil {
		return nil, err
	}
	amount := utils.ToPaise(total)
	rzpOrder, err := rzp.Order.Create(map[string]interface{}{
		"amount": amount, "currency": "INR", "receipt": orderNumber,
		"notes": map[string]string{"orderId": order.ID},
	}, nil)
	if err != nil {
		return nil, err
	}
	rzpID, ok := rzpOrder["id"].(string)
	if !ok || rzpID == "" {
		return nil, utils.BadRequest("failed to create payment order")
	}
	if err := store.UpdateOrderRazorpayID(ctx, order.ID, rzpID); err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"orderId": order.ID, "orderNumber": orderNumber,
		"razorpayOrderId": rzpID, "amount": amount, "currency": "INR",
		"key": lib.RazorpayPublicKey(),
	}, nil
}

func VerifyPayment(ctx context.Context, userID, rzpOrderID, rzpPaymentID, signature string) (map[string]string, error) {
	secret := os.Getenv("RAZORPAY_KEY_SECRET")
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(rzpOrderID + "|" + rzpPaymentID))
	expected := hex.EncodeToString(mac.Sum(nil))
	if expected != signature {
		return nil, utils.BadRequest("invalid payment signature")
	}
	if !lib.ValidID(userID) {
		return nil, utils.BadRequest("invalid user")
	}

	order, err := store.VerifyAndPayOrder(ctx, userID, rzpOrderID, rzpPaymentID)
	if err == pgx.ErrNoRows {
		return nil, utils.ErrNotFound
	}
	if err != nil {
		if err.Error() == "insufficient stock" {
			return nil, utils.BadRequest("insufficient stock for one or more products")
		}
		return nil, err
	}
	return map[string]string{"orderNumber": order.OrderNumber}, nil
}

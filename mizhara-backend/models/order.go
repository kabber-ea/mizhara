package models

import "time"

type DeliveryStatus string
type PaymentStatus string
type TrackingProvider string

const (
	DeliveryProcessing DeliveryStatus = "processing"
	DeliveryShipped    DeliveryStatus = "shipped"
	DeliveryDelivered  DeliveryStatus = "delivered"
	PaymentPending     PaymentStatus  = "pending"
	PaymentPaid        PaymentStatus  = "paid"
	PaymentFailed      PaymentStatus  = "failed"
)

type OrderItem struct {
	ProductID string  `json:"productId"`
	Name      string  `json:"name"`
	Price     float64 `json:"price"`
	Quantity  int     `json:"quantity"`
	Size      string  `json:"size"`
	Image     string  `json:"image"`
	Category  string  `json:"category,omitempty"`
}

type ShippingAddress struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Phone   string `json:"phone"`
	Address string `json:"address"`
	City    string `json:"city"`
	State   string `json:"state"`
	Pincode string `json:"pincode"`
}

type Order struct {
	ID                string           `json:"id"`
	UserID            string           `json:"userId"`
	OrderNumber       string           `json:"orderNumber"`
	Items             []OrderItem      `json:"items"`
	ShippingAddress   ShippingAddress  `json:"shippingAddress"`
	Subtotal          float64          `json:"subtotal"`
	DiscountAmount    float64          `json:"discountAmount,omitempty"`
	OfferID           string           `json:"offerId,omitempty"`
	OfferName         string           `json:"offerName,omitempty"`
	Shipping          float64          `json:"shipping"`
	Total             float64          `json:"total"`
	Currency          string           `json:"currency"`
	PaymentStatus     PaymentStatus    `json:"paymentStatus"`
	DeliveryStatus    DeliveryStatus   `json:"deliveryStatus"`
	TrackingProvider  TrackingProvider `json:"trackingProvider,omitempty"`
	TrackingNumber    string           `json:"trackingNumber,omitempty"`
	TrackingURL       string           `json:"trackingUrl,omitempty"`
	ShippedAt         *time.Time       `json:"shippedAt,omitempty"`
	DeliveredAt       *time.Time       `json:"deliveredAt,omitempty"`
	RazorpayOrderID   string           `json:"razorpayOrderId,omitempty"`
	RazorpayPaymentID string           `json:"razorpayPaymentId,omitempty"`
	CreatedAt         time.Time        `json:"createdAt"`
	UpdatedAt         time.Time        `json:"updatedAt"`
}

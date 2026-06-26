package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type DeliveryStatus string
type PaymentStatus string
type TrackingProvider string

const (
	DeliveryProcessing      DeliveryStatus = "processing"
	DeliveryPacked            DeliveryStatus = "packed"
	DeliveryShipped           DeliveryStatus = "shipped"
	DeliveryOutForDelivery    DeliveryStatus = "out_for_delivery"
	DeliveryDelivered         DeliveryStatus = "delivered"
	DeliveryCancelled         DeliveryStatus = "cancelled"
	DeliveryReturned          DeliveryStatus = "returned"
	PaymentPending            PaymentStatus  = "pending"
	PaymentPaid               PaymentStatus  = "paid"
	PaymentFailed             PaymentStatus  = "failed"
)

type OrderItem struct {
	ProductID string  `bson:"productId" json:"productId"`
	Name      string  `bson:"name" json:"name"`
	Price     float64 `bson:"price" json:"price"`
	Quantity  int     `bson:"quantity" json:"quantity"`
	Size      string  `bson:"size" json:"size"`
	Image     string  `bson:"image" json:"image"`
	Category  string  `bson:"category,omitempty" json:"category,omitempty"`
}

type ShippingAddress struct {
	Name    string `bson:"name" json:"name"`
	Email   string `bson:"email" json:"email"`
	Phone   string `bson:"phone" json:"phone"`
	Address string `bson:"address" json:"address"`
	City    string `bson:"city" json:"city"`
	State   string `bson:"state" json:"state"`
	Pincode string `bson:"pincode" json:"pincode"`
}

type Order struct {
	ID                primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID            primitive.ObjectID `bson:"userId" json:"userId"`
	OrderNumber       string             `bson:"orderNumber" json:"orderNumber"`
	Items             []OrderItem        `bson:"items" json:"items"`
	ShippingAddress   ShippingAddress    `bson:"shippingAddress" json:"shippingAddress"`
	Subtotal          float64            `bson:"subtotal" json:"subtotal"`
	Shipping          float64            `bson:"shipping" json:"shipping"`
	Total             float64            `bson:"total" json:"total"`
	Currency          string             `bson:"currency" json:"currency"`
	PaymentStatus     PaymentStatus      `bson:"paymentStatus" json:"paymentStatus"`
	DeliveryStatus    DeliveryStatus     `bson:"deliveryStatus" json:"deliveryStatus"`
	TrackingProvider  TrackingProvider   `bson:"trackingProvider,omitempty" json:"trackingProvider,omitempty"`
	TrackingNumber    string             `bson:"trackingNumber,omitempty" json:"trackingNumber,omitempty"`
	TrackingURL       string             `bson:"trackingUrl,omitempty" json:"trackingUrl,omitempty"`
	ShippedAt         *time.Time         `bson:"shippedAt,omitempty" json:"shippedAt,omitempty"`
	DeliveredAt       *time.Time         `bson:"deliveredAt,omitempty" json:"deliveredAt,omitempty"`
	RazorpayOrderID   string             `bson:"razorpayOrderId,omitempty" json:"razorpayOrderId,omitempty"`
	RazorpayPaymentID string             `bson:"razorpayPaymentId,omitempty" json:"razorpayPaymentId,omitempty"`
	CreatedAt         time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt         time.Time          `bson:"updatedAt" json:"updatedAt"`
}

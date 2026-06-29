package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OfferType string
type OfferScope string

const (
	OfferTypePercentage OfferType = "percentage"
	OfferTypeFixed      OfferType = "fixed"
	OfferTypeBogo       OfferType = "bogo"
	OfferScopeAll       OfferScope = "all"
	OfferScopeSelected  OfferScope = "selected"
)

type Offer struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name         string             `bson:"name" json:"name"`
	Description  string             `bson:"description" json:"description"`
	Image        string             `bson:"image,omitempty" json:"image,omitempty"`
	Type         OfferType          `bson:"type" json:"type"`
	Scope        OfferScope         `bson:"scope" json:"scope"`
	Percentage   float64            `bson:"percentage,omitempty" json:"percentage,omitempty"`
	FixedAmount  float64            `bson:"fixedAmount,omitempty" json:"fixedAmount,omitempty"`
	MinPurchase  float64            `bson:"minPurchase,omitempty" json:"minPurchase,omitempty"`
	MaxDiscount  float64            `bson:"maxDiscount,omitempty" json:"maxDiscount,omitempty"`
	BuyQuantity  int                `bson:"buyQuantity,omitempty" json:"buyQuantity,omitempty"`
	FreeQuantity int                `bson:"freeQuantity,omitempty" json:"freeQuantity,omitempty"`
	ProductIDs   []string           `bson:"productIds,omitempty" json:"productIds,omitempty"`
	Code         string             `bson:"code,omitempty" json:"code,omitempty"`
	IsActive     *bool              `bson:"isActive,omitempty" json:"isActive"`
	StartsAt     *time.Time         `bson:"startsAt,omitempty" json:"startsAt,omitempty"`
	EndsAt       *time.Time         `bson:"endsAt,omitempty" json:"endsAt,omitempty"`
	CreatedAt    time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updatedAt" json:"updatedAt"`
}

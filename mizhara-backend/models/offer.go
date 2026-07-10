package models

import "time"

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
	ID           string     `json:"id"`
	Name         string     `json:"name"`
	Description  string     `json:"description"`
	Type         OfferType  `json:"type"`
	Scope        OfferScope `json:"scope"`
	Percentage   float64    `json:"percentage,omitempty"`
	FixedAmount  float64    `json:"fixedAmount,omitempty"`
	MinPurchase  float64    `json:"minPurchase,omitempty"`
	MaxDiscount  float64    `json:"maxDiscount,omitempty"`
	BuyQuantity  int        `json:"buyQuantity,omitempty"`
	FreeQuantity int        `json:"freeQuantity,omitempty"`
	ProductIDs   []string   `json:"productIds,omitempty"`
	Code         string     `json:"code,omitempty"`
	IsActive     *bool      `json:"isActive"`
	StartsAt     *time.Time `json:"startsAt,omitempty"`
	EndsAt       *time.Time `json:"endsAt,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
}

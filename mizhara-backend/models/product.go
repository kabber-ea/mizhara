package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Product struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name         string             `bson:"name" json:"name"`
	Description  string             `bson:"description" json:"description"`
	Category     string             `bson:"category" json:"category"`
	CostPrice    float64            `bson:"costPrice" json:"costPrice,omitempty"`
	Price        float64            `bson:"price" json:"price"`
	Rating       float64            `bson:"rating" json:"rating"`
	ReviewsCount int                `bson:"reviewsCount" json:"reviewsCount"`
	Images       []string           `bson:"images" json:"images"`
	Materials    []string           `bson:"materials" json:"materials"`
	Sizes        []string           `bson:"sizes" json:"sizes"`
	IsFeatured    bool `bson:"isFeatured" json:"isFeatured"`
	IsActive      *bool `bson:"isActive,omitempty" json:"isActive"`
	StockQuantity int  `bson:"stockQuantity" json:"stockQuantity"`
	InStock       bool `bson:"inStock" json:"inStock"`
	CreatedAt    time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updatedAt" json:"updatedAt"`
}

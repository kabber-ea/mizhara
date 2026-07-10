package models

import "time"

type Product struct {
	ID                string    `json:"id"`
	Name              string    `json:"name"`
	Description       string    `json:"description"`
	Category          string    `json:"category"`
	CategoryID        string    `json:"categoryId,omitempty"`
	CostPrice         float64   `json:"costPrice,omitempty"`
	Price             float64   `json:"price"`
	Rating            float64   `json:"rating"`
	ReviewsCount      int       `json:"reviewsCount"`
	Images            []string  `json:"images"`
	BannerImage       string    `json:"bannerImage,omitempty"`
	BannerImageMobile string    `json:"bannerImageMobile,omitempty"`
	Materials         []string  `json:"materials"`
	Sizes             []string  `json:"sizes"`
	IsFeatured        bool      `json:"isFeatured"`
	IsActive          *bool     `json:"isActive"`
	StockQuantity     int       `json:"stockQuantity"`
	InStock           bool      `json:"inStock"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
}

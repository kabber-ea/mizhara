package services

import (
	"context"
	"time"

	"mizhara-backend/lib"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func syncInStock(stock int) bool {
	return stock > 0
}

func DeductStockForOrder(ctx context.Context, items []struct {
	ProductID string
	Quantity  int
}) error {
	for _, item := range items {
		if item.ProductID == "" || item.Quantity <= 0 {
			continue
		}
		oid, err := primitive.ObjectIDFromHex(item.ProductID)
		if err != nil {
			continue
		}
		var doc struct {
			StockQuantity int `bson:"stockQuantity"`
		}
		err = lib.Products().FindOne(ctx, bson.M{"_id": oid}).Decode(&doc)
		if err != nil {
			continue
		}
		newStock := doc.StockQuantity - item.Quantity
		if newStock < 0 {
			newStock = 0
		}
		_, _ = lib.Products().UpdateOne(ctx, bson.M{"_id": oid}, bson.M{
			"$set": bson.M{
				"stockQuantity": newStock,
				"inStock":       syncInStock(newStock),
				"updatedAt":     time.Now(),
			},
		})
	}
	return nil
}

func ValidateOrderStock(ctx context.Context, items []struct {
	ProductID string
	Quantity  int
	Name      string
}) error {
	for _, item := range items {
		if item.ProductID == "" || item.Quantity <= 0 {
			continue
		}
		oid, err := primitive.ObjectIDFromHex(item.ProductID)
		if err != nil {
			return lib.BadRequest("invalid product in cart")
		}
		var doc struct {
			Name          string `bson:"name"`
			StockQuantity int    `bson:"stockQuantity"`
			InStock       bool   `bson:"inStock"`
		}
		err = lib.Products().FindOne(ctx, bson.M{"_id": oid}).Decode(&doc)
		if err != nil {
			return lib.BadRequest("product no longer available")
		}
		available := doc.StockQuantity
		if available <= 0 && doc.InStock {
			available = 1
		}
		if available < item.Quantity {
			name := doc.Name
			if name == "" {
				name = item.Name
			}
			return lib.BadRequest(name + " does not have enough stock")
		}
	}
	return nil
}

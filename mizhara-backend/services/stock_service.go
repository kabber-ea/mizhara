package services

import (
	"context"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func syncInStock(stock int) bool {
	return stock > 0
}

type StockLineItem struct {
	ProductID string
	Quantity  int
}

func DeductStockForOrder(ctx context.Context, items []StockLineItem) error {
	for _, item := range items {
		if err := deductProductStock(ctx, item.ProductID, item.Quantity); err != nil {
			return err
		}
	}
	return nil
}

func deductProductStock(ctx context.Context, productID string, quantity int) error {
	if productID == "" || quantity <= 0 {
		return nil
	}
	oid, err := primitive.ObjectIDFromHex(productID)
	if err != nil {
		return utils.BadRequest("invalid product in order")
	}

	now := time.Now()
	filter := bson.M{
		"_id":           oid,
		"stockQuantity": bson.M{"$gte": quantity},
	}
	update := bson.A{
		bson.M{"$set": bson.M{
			"stockQuantity": bson.M{"$subtract": bson.A{"$stockQuantity", quantity}},
			"inStock": bson.M{"$gt": bson.A{
				bson.M{"$subtract": bson.A{"$stockQuantity", quantity}},
				0,
			}},
			"updatedAt": now,
		}},
	}
	res, err := lib.Products().UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return utils.BadRequest("insufficient stock for one or more products")
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
			return utils.BadRequest("invalid product in cart")
		}
		var doc struct {
			Name          string `bson:"name"`
			StockQuantity int    `bson:"stockQuantity"`
			InStock       bool   `bson:"inStock"`
		}
		err = lib.Products().FindOne(ctx, bson.M{"_id": oid}).Decode(&doc)
		if err != nil {
			return utils.BadRequest("product no longer available")
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
			return utils.BadRequest(name + " does not have enough stock")
		}
	}
	return nil
}

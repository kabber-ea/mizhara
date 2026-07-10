package services

import (
	"context"

	"mizhara-backend/lib"
	"mizhara-backend/store"
	"mizhara-backend/utils"
)

func syncInStock(stock int) bool {
	return stock > 0
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
		if !lib.ValidID(item.ProductID) {
			return utils.BadRequest("invalid product in cart")
		}
		doc, err := store.FindProductByID(ctx, item.ProductID)
		if err != nil || doc == nil {
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

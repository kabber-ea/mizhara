package seed

import (
	"time"

	"mizhara-backend/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func BuildOffers(now time.Time, seeds []OfferSeed, products []ProductSeed, productByName map[string]primitive.ObjectID) []models.Offer {
	out := make([]models.Offer, 0, len(seeds))
	for _, s := range seeds {
		isActive := s.IsActive
		o := models.Offer{
			ID:           primitive.NewObjectID(),
			Name:         s.Name,
			Description:  s.Description,
			Type:         models.OfferType(s.Type),
			Scope:        models.OfferScope(s.Scope),
			Percentage:   s.Percentage,
			FixedAmount:  s.FixedAmount,
			MinPurchase:  s.MinPurchase,
			MaxDiscount:  s.MaxDiscount,
			BuyQuantity:  s.BuyQuantity,
			FreeQuantity: s.FreeQuantity,
			Code:         s.Code,
			IsActive:     &isActive,
			CreatedAt:    now,
			UpdatedAt:    now,
		}
		if len(s.ProductCategories) > 0 {
			o.ProductIDs = productIDsByCategories(products, productByName, s.ProductCategories, s.ProductsPerCategory)
		}
		out = append(out, o)
	}
	return out
}

func productIDsByCategories(products []ProductSeed, productByName map[string]primitive.ObjectID, categories []string, perCategory int) []string {
	var ids []string
	for _, cat := range categories {
		n := 0
		for _, p := range products {
			if p.Category != cat {
				continue
			}
			id, ok := productByName[p.Name]
			if !ok {
				continue
			}
			ids = append(ids, id.Hex())
			n++
			if perCategory > 0 && n >= perCategory {
				break
			}
		}
	}
	return ids
}

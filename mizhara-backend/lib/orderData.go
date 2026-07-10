package lib

import (
	"context"
	"log"
	"time"

	"mizhara-backend/models"
	"go.mongodb.org/mongo-driver/bson"
)

func EnsurePaidOrders() error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	res, err := Orders().UpdateMany(ctx, bson.M{
		"paymentStatus": bson.M{"$ne": models.PaymentPaid},
	}, bson.M{
		"$set": bson.M{"paymentStatus": models.PaymentPaid},
	})
	if err != nil {
		return err
	}
	if res.ModifiedCount > 0 {
		log.Printf("marked %d orders as paid", res.ModifiedCount)
	}
	return nil
}

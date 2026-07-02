package lib

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func EnsureIndexes() error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	groups := []struct {
		name   string
		coll   *mongo.Collection
		models []mongo.IndexModel
	}{
		{
			name: "users",
			coll: Users(),
			models: []mongo.IndexModel{
				{
					Keys:    bson.D{{Key: "email", Value: 1}},
					Options: options.Index().SetUnique(true).SetSparse(true),
				},
				{
					Keys:    bson.D{{Key: "phone", Value: 1}},
					Options: options.Index().SetUnique(true).SetSparse(true),
				},
			},
		},
		{
			name: "orders",
			coll: Orders(),
			models: []mongo.IndexModel{
				{Keys: bson.D{{Key: "userId", Value: 1}}},
				{Keys: bson.D{{Key: "userId", Value: 1}, {Key: "createdAt", Value: -1}}},
				{
					Keys:    bson.D{{Key: "razorpayOrderId", Value: 1}},
					Options: options.Index().SetSparse(true),
				},
			},
		},
		{
			name: "products",
			coll: Products(),
			models: []mongo.IndexModel{
				{Keys: bson.D{{Key: "category", Value: 1}, {Key: "isActive", Value: 1}}},
				{Keys: bson.D{{Key: "categoryId", Value: 1}, {Key: "isActive", Value: 1}}},
			},
		},
		{
			name: "offers",
			coll: Offers(),
			models: []mongo.IndexModel{
				{
					Keys:    bson.D{{Key: "code", Value: 1}},
					Options: options.Index().SetUnique(true).SetSparse(true),
				},
			},
		},
		{
			name: "categories",
			coll: Categories(),
			models: []mongo.IndexModel{
				{
					Keys:    bson.D{{Key: "name", Value: 1}},
					Options: options.Index().SetUnique(true),
				},
			},
		},
	}

	for _, group := range groups {
		names, err := group.coll.Indexes().CreateMany(ctx, group.models)
		if err != nil {
			return err
		}
		log.Printf("indexes ensured on %s: %v", group.name, names)
	}
	return nil
}

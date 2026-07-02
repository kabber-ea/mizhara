package lib

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RunMigrations(ctx context.Context) error {
	return migrateProductCategoryIDs(ctx)
}

func migrateProductCategoryIDs(ctx context.Context) error {
	cur, err := Categories().Find(ctx, bson.M{})
	if err != nil {
		return err
	}
	defer cur.Close(ctx)

	nameToID := make(map[string]primitive.ObjectID)
	for cur.Next(ctx) {
		var doc struct {
			ID   primitive.ObjectID `bson:"_id"`
			Name string             `bson:"name"`
		}
		if err := cur.Decode(&doc); err != nil {
			return err
		}
		nameToID[doc.Name] = doc.ID
	}
	if err := cur.Err(); err != nil {
		return err
	}

	productCur, err := Products().Find(ctx, bson.M{
		"$or": bson.A{
			bson.M{"categoryId": bson.M{"$exists": false}},
			bson.M{"categoryId": primitive.NilObjectID},
		},
		"category": bson.M{"$ne": ""},
	})
	if err != nil {
		return err
	}
	defer productCur.Close(ctx)

	var updated int
	for productCur.Next(ctx) {
		var doc struct {
			ID       primitive.ObjectID `bson:"_id"`
			Category string             `bson:"category"`
		}
		if err := productCur.Decode(&doc); err != nil {
			return err
		}
		categoryID, ok := nameToID[doc.Category]
		if !ok {
			continue
		}
		res, err := Products().UpdateOne(ctx, bson.M{"_id": doc.ID}, bson.M{
			"$set": bson.M{"categoryId": categoryID},
		})
		if err != nil {
			return err
		}
		updated += int(res.ModifiedCount)
	}
	if err := productCur.Err(); err != nil {
		return err
	}
	if updated > 0 {
		log.Printf("migration: set categoryId on %d product(s)", updated)
	}
	return nil
}

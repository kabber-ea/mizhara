package services

import (
	"context"
	"strings"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func CreateCategoryForAdmin(ctx context.Context, session *lib.SessionPayload, name string) error {
	if err := RequireAdmin(session); err != nil {
		return err
	}
	return CreateCategory(ctx, name)
}

func ListCategoryNames(ctx context.Context) ([]string, error) {
	cur, err := lib.Categories().Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "name", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var names []string
	for cur.Next(ctx) {
		var c models.Category
		_ = cur.Decode(&c)
		names = append(names, c.Name)
	}
	return names, nil
}

func CreateCategory(ctx context.Context, name string) error {
	trimmed := strings.TrimSpace(name)
	if trimmed == "" {
		return lib.BadRequest("category name is required")
	}
	slug := strings.ToLower(strings.ReplaceAll(trimmed, " ", "-"))
	now := time.Now()
	_, err := lib.Categories().InsertOne(ctx, models.Category{
		ID: primitive.NewObjectID(), Name: trimmed, Slug: slug, CreatedAt: now, UpdatedAt: now,
	})
	return err
}

func DeleteCategory(ctx context.Context, name string) error {
	_, err := lib.Categories().DeleteOne(ctx, bson.M{"name": name})
	return err
}

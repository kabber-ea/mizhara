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

type SerializedCategory struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Slug  string `json:"slug"`
	Image string `json:"image,omitempty"`
}

type CategoryInput struct {
	ID    string `json:"id,omitempty"`
	Name  string `json:"name"`
	Image string `json:"image"`
}

func serializeCategory(c models.Category) SerializedCategory {
	return SerializedCategory{
		ID: c.ID.Hex(), Name: c.Name, Slug: c.Slug, Image: c.Image,
	}
}

func CreateCategoryForAdmin(ctx context.Context, session *lib.SessionPayload, input CategoryInput) (*SerializedCategory, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	c, err := createCategory(ctx, input.Name, input.Image)
	if err != nil {
		return nil, err
	}
	out := serializeCategory(*c)
	return &out, nil
}

func UpdateCategoryForAdmin(ctx context.Context, session *lib.SessionPayload, input CategoryInput) (*SerializedCategory, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	id, err := primitive.ObjectIDFromHex(strings.TrimSpace(input.ID))
	if err != nil {
		return nil, lib.BadRequest("invalid category id")
	}
	name := strings.TrimSpace(input.Name)
	if name == "" {
		return nil, lib.BadRequest("category name is required")
	}
	image := strings.TrimSpace(input.Image)
	if image == "" {
		return nil, lib.BadRequest("category image is required")
	}
	slug := strings.ToLower(strings.ReplaceAll(name, " ", "-"))
	now := time.Now()
	res, err := lib.Categories().UpdateOne(ctx, bson.M{"_id": id}, bson.M{
		"$set": bson.M{"name": name, "slug": slug, "image": image, "updatedAt": now},
	})
	if err != nil {
		return nil, err
	}
	if res.MatchedCount == 0 {
		return nil, lib.ErrNotFound
	}
	var c models.Category
	if err := lib.Categories().FindOne(ctx, bson.M{"_id": id}).Decode(&c); err != nil {
		return nil, err
	}
	out := serializeCategory(c)
	return &out, nil
}

func ListCategories(ctx context.Context) ([]SerializedCategory, error) {
	cur, err := lib.Categories().Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "name", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var out []SerializedCategory
	for cur.Next(ctx) {
		var c models.Category
		_ = cur.Decode(&c)
		out = append(out, serializeCategory(c))
	}
	if out == nil {
		out = []SerializedCategory{}
	}
	return out, nil
}

func ListCategoryNames(ctx context.Context) ([]string, error) {
	items, err := ListCategories(ctx)
	if err != nil {
		return nil, err
	}
	names := make([]string, len(items))
	for i, item := range items {
		names[i] = item.Name
	}
	return names, nil
}

func createCategory(ctx context.Context, name, image string) (*models.Category, error) {
	trimmed := strings.TrimSpace(name)
	if trimmed == "" {
		return nil, lib.BadRequest("category name is required")
	}
	image = strings.TrimSpace(image)
	if image == "" {
		return nil, lib.BadRequest("category image is required")
	}
	slug := strings.ToLower(strings.ReplaceAll(trimmed, " ", "-"))
	now := time.Now()
	doc := models.Category{
		ID: primitive.NewObjectID(), Name: trimmed, Slug: slug, Image: image,
		CreatedAt: now, UpdatedAt: now,
	}
	if _, err := lib.Categories().InsertOne(ctx, doc); err != nil {
		return nil, err
	}
	return &doc, nil
}

func CreateCategory(ctx context.Context, name, image string) error {
	_, err := createCategory(ctx, name, image)
	return err
}

func DeleteCategory(ctx context.Context, name string) error {
	_, err := lib.Categories().DeleteOne(ctx, bson.M{"name": name})
	return err
}

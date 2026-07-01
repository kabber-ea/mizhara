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

func boolPtr(v bool) *bool {
	return &v
}

type SerializedCategory struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	IsActive bool   `json:"isActive"`
}

type CategoryInput struct {
	ID       string `json:"id,omitempty"`
	Name     string `json:"name"`
	IsActive *bool  `json:"isActive,omitempty"`
}

func categoryIsActive(c models.Category) bool {
	if c.IsActive == nil {
		return true
	}
	return *c.IsActive
}

func serializeCategory(c models.Category) SerializedCategory {
	return SerializedCategory{
		ID: c.ID.Hex(), Name: c.Name, Slug: c.Slug,
		IsActive: categoryIsActive(c),
	}
}

func CreateCategoryForAdmin(ctx context.Context, session *lib.SessionPayload, input CategoryInput) (*SerializedCategory, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	c, err := createCategory(ctx, input.Name)
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
	var existing models.Category
	if err := lib.Categories().FindOne(ctx, bson.M{"_id": id}).Decode(&existing); err != nil {
		return nil, lib.ErrNotFound
	}
	slug := strings.ToLower(strings.ReplaceAll(name, " ", "-"))
	var duplicate models.Category
	dupErr := lib.Categories().FindOne(ctx, bson.M{"name": name, "_id": bson.M{"$ne": id}}).Decode(&duplicate)
	if dupErr == nil {
		return nil, lib.BadRequest("a category with this name already exists")
	}
	oldName := existing.Name
	now := time.Now()
	set := bson.M{"name": name, "slug": slug, "updatedAt": now}
	if input.IsActive != nil {
		set["isActive"] = *input.IsActive
	}
	res, err := lib.Categories().UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": set})
	if err != nil {
		return nil, err
	}
	if res.MatchedCount == 0 {
		return nil, lib.ErrNotFound
	}
	if oldName != name {
		_, _ = lib.Products().UpdateMany(ctx, bson.M{"category": oldName}, bson.M{
			"$set": bson.M{"category": name, "updatedAt": now},
		})
	}
	var c models.Category
	if err := lib.Categories().FindOne(ctx, bson.M{"_id": id}).Decode(&c); err != nil {
		return nil, err
	}
	out := serializeCategory(c)
	return &out, nil
}

func DeleteCategoryForAdmin(ctx context.Context, session *lib.SessionPayload, id string) error {
	if err := RequireAdmin(session); err != nil {
		return err
	}
	oid, err := primitive.ObjectIDFromHex(strings.TrimSpace(id))
	if err != nil {
		return lib.BadRequest("invalid category id")
	}
	var cat models.Category
	if err := lib.Categories().FindOne(ctx, bson.M{"_id": oid}).Decode(&cat); err != nil {
		return lib.ErrNotFound
	}
	count, err := lib.Products().CountDocuments(ctx, bson.M{"category": cat.Name})
	if err != nil {
		return err
	}
	if count > 0 {
		return lib.BadRequest("cannot delete a category that still has products assigned")
	}
	res, err := lib.Categories().DeleteOne(ctx, bson.M{"_id": oid})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return lib.ErrNotFound
	}
	return nil
}

func ListCategoriesForViewer(ctx context.Context, session *lib.SessionPayload) ([]SerializedCategory, error) {
	if session != nil && session.Role == lib.RoleAdmin {
		return ListCategories(ctx)
	}
	return ListActiveCategories(ctx)
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

func ListActiveCategories(ctx context.Context) ([]SerializedCategory, error) {
	cur, err := lib.Categories().Find(ctx, bson.M{
		"isActive": bson.M{"$ne": false},
	}, options.Find().SetSort(bson.D{{Key: "name", Value: 1}}))
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

func ListActiveCategoryNames(ctx context.Context) ([]string, error) {
	items, err := ListActiveCategories(ctx)
	if err != nil {
		return nil, err
	}
	names := make([]string, len(items))
	for i, item := range items {
		names[i] = item.Name
	}
	return names, nil
}

func createCategory(ctx context.Context, name string) (*models.Category, error) {
	trimmed := strings.TrimSpace(name)
	if trimmed == "" {
		return nil, lib.BadRequest("category name is required")
	}
	slug := strings.ToLower(strings.ReplaceAll(trimmed, " ", "-"))
	now := time.Now()
	doc := models.Category{
		ID: primitive.NewObjectID(), Name: trimmed, Slug: slug,
		IsActive: boolPtr(true),
		CreatedAt: now, UpdatedAt: now,
	}
	if _, err := lib.Categories().InsertOne(ctx, doc); err != nil {
		return nil, err
	}
	return &doc, nil
}

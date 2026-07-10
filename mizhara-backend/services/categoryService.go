package services

import (
	"context"
	"strings"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"
	"mizhara-backend/store"
	"mizhara-backend/utils"
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
		ID: c.ID, Name: c.Name, Slug: c.Slug,
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
	id := strings.TrimSpace(input.ID)
	if !lib.ValidID(id) {
		return nil, utils.BadRequest("invalid category id")
	}
	name := strings.TrimSpace(input.Name)
	if name == "" {
		return nil, utils.BadRequest("category name is required")
	}
	existing, err := store.FindCategoryByID(ctx, id)
	if err != nil || existing == nil {
		return nil, utils.ErrNotFound
	}
	if dup, _ := store.FindCategoryByNameExcluding(ctx, name, id); dup != nil {
		return nil, utils.BadRequest("a category with this name already exists")
	}
	oldName := existing.Name
	now := time.Now()
	existing.Name = name
	existing.Slug = strings.ToLower(strings.ReplaceAll(name, " ", "-"))
	existing.UpdatedAt = now
	if input.IsActive != nil {
		existing.IsActive = input.IsActive
	}
	if err := store.UpdateCategory(ctx, existing); err != nil {
		return nil, err
	}
	if oldName != name {
		_ = store.UpdateProductsCategoryName(ctx, id, name, now)
		_ = store.UpdateProductsLegacyCategory(ctx, oldName, name, id, now)
	}
	out := serializeCategory(*existing)
	return &out, nil
}

func DeleteCategoryForAdmin(ctx context.Context, session *lib.SessionPayload, id string) error {
	if err := RequireAdmin(session); err != nil {
		return err
	}
	id = strings.TrimSpace(id)
	if !lib.ValidID(id) {
		return utils.BadRequest("invalid category id")
	}
	cat, err := store.FindCategoryByID(ctx, id)
	if err != nil || cat == nil {
		return utils.ErrNotFound
	}
	count, err := store.CountProductsInCategory(ctx, id, cat.Name)
	if err != nil {
		return err
	}
	if count > 0 {
		return utils.BadRequest("cannot delete a category that still has products assigned")
	}
	ok, err := store.DeleteCategory(ctx, id)
	if err != nil {
		return err
	}
	if !ok {
		return utils.ErrNotFound
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
	cats, err := store.ListCategories(ctx, false)
	if err != nil {
		return nil, err
	}
	out := make([]SerializedCategory, 0, len(cats))
	for _, c := range cats {
		out = append(out, serializeCategory(c))
	}
	return out, nil
}

func ListActiveCategories(ctx context.Context) ([]SerializedCategory, error) {
	cats, err := store.ListCategories(ctx, true)
	if err != nil {
		return nil, err
	}
	out := make([]SerializedCategory, 0, len(cats))
	for _, c := range cats {
		out = append(out, serializeCategory(c))
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
		return nil, utils.BadRequest("category name is required")
	}
	slug := strings.ToLower(strings.ReplaceAll(trimmed, " ", "-"))
	now := time.Now()
	doc := models.Category{
		ID: lib.NewID(), Name: trimmed, Slug: slug,
		IsActive: boolPtr(true),
		CreatedAt: now, UpdatedAt: now,
	}
	if err := store.InsertCategory(ctx, &doc); err != nil {
		return nil, err
	}
	return &doc, nil
}

package store

import (
	"context"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"

	"github.com/jackc/pgx/v5"
)

func scanCategory(row pgx.Row) (*models.Category, error) {
	var c models.Category
	var isActive *bool
	err := row.Scan(&c.ID, &c.Name, &c.Slug, &isActive, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return nil, err
	}
	c.IsActive = isActive
	return &c, nil
}

func InsertCategory(ctx context.Context, c *models.Category) error {
	isActive := true
	if c.IsActive != nil {
		isActive = *c.IsActive
	}
	_, err := lib.DB().Exec(ctx, `
		INSERT INTO categories (id, name, slug, is_active, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6)
	`, c.ID, c.Name, c.Slug, isActive, c.CreatedAt, c.UpdatedAt)
	return err
}

func FindCategoryByID(ctx context.Context, id string) (*models.Category, error) {
	row := lib.DB().QueryRow(ctx, `
		SELECT id, name, slug, is_active, created_at, updated_at FROM categories WHERE id=$1
	`, id)
	c, err := scanCategory(row)
	if isNoRows(err) {
		return nil, nil
	}
	return c, err
}

func FindCategoryByName(ctx context.Context, name string) (*models.Category, error) {
	row := lib.DB().QueryRow(ctx, `
		SELECT id, name, slug, is_active, created_at, updated_at FROM categories WHERE name=$1
	`, name)
	c, err := scanCategory(row)
	if isNoRows(err) {
		return nil, nil
	}
	return c, err
}

func FindCategoryByNameExcluding(ctx context.Context, name, excludeID string) (*models.Category, error) {
	row := lib.DB().QueryRow(ctx, `
		SELECT id, name, slug, is_active, created_at, updated_at FROM categories WHERE name=$1 AND id<>$2
	`, name, excludeID)
	c, err := scanCategory(row)
	if isNoRows(err) {
		return nil, nil
	}
	return c, err
}

func ListCategories(ctx context.Context, activeOnly bool) ([]models.Category, error) {
	q := `SELECT id, name, slug, is_active, created_at, updated_at FROM categories`
	if activeOnly {
		q += ` WHERE is_active IS DISTINCT FROM FALSE`
	}
	q += ` ORDER BY name ASC`

	rows, err := lib.DB().Query(ctx, q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.Category
	for rows.Next() {
		var c models.Category
		var isActive *bool
		if err := rows.Scan(&c.ID, &c.Name, &c.Slug, &isActive, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, err
		}
		c.IsActive = isActive
		out = append(out, c)
	}
	return out, rows.Err()
}

func UpdateCategory(ctx context.Context, c *models.Category) error {
	isActive := true
	if c.IsActive != nil {
		isActive = *c.IsActive
	}
	tag, err := lib.DB().Exec(ctx, `
		UPDATE categories SET name=$2, slug=$3, is_active=$4, updated_at=$5 WHERE id=$1
	`, c.ID, c.Name, c.Slug, isActive, c.UpdatedAt)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

func DeleteCategory(ctx context.Context, id string) (bool, error) {
	tag, err := lib.DB().Exec(ctx, `DELETE FROM categories WHERE id=$1`, id)
	if err != nil {
		return false, err
	}
	return tag.RowsAffected() > 0, nil
}

func CountProductsInCategory(ctx context.Context, categoryID, categoryName string) (int64, error) {
	var n int64
	err := lib.DB().QueryRow(ctx, `
		SELECT COUNT(*) FROM products
		WHERE category_id=$1 OR (category=$2 AND (category_id IS NULL OR category_id=''))
	`, categoryID, categoryName).Scan(&n)
	return n, err
}

func UpdateProductsCategoryName(ctx context.Context, categoryID, newName string, updatedAt time.Time) error {
	_, err := lib.DB().Exec(ctx, `
		UPDATE products SET category=$2, updated_at=$3 WHERE category_id=$1
	`, categoryID, newName, updatedAt)
	return err
}

func UpdateProductsLegacyCategory(ctx context.Context, oldName, newName, categoryID string, updatedAt time.Time) error {
	_, err := lib.DB().Exec(ctx, `
		UPDATE products SET category=$2, category_id=$3, updated_at=$4
		WHERE category=$1 AND (category_id IS NULL OR category_id='')
	`, oldName, newName, categoryID, updatedAt)
	return err
}

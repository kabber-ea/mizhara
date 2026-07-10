package store

import (
	"context"
	"fmt"
	"strings"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"

	"github.com/jackc/pgx/v5"
)

func scanProduct(row pgx.Row) (*models.Product, error) {
	var p models.Product
	var imagesJSON, materialsJSON, sizesJSON []byte
	var categoryID *string
	var isActive *bool
	err := row.Scan(
		&p.ID, &p.Name, &p.Description, &p.Category, &categoryID,
		&p.CostPrice, &p.Price, &p.Rating, &p.ReviewsCount,
		&imagesJSON, &p.BannerImage, &p.BannerImageMobile,
		&materialsJSON, &sizesJSON,
		&p.IsFeatured, &isActive, &p.StockQuantity, &p.InStock,
		&p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	if categoryID != nil {
		p.CategoryID = *categoryID
	}
	p.IsActive = isActive
	_ = scanJSON(imagesJSON, &p.Images)
	_ = scanJSON(materialsJSON, &p.Materials)
	_ = scanJSON(sizesJSON, &p.Sizes)
	return &p, nil
}

const productCols = `id, name, description, category, category_id, cost_price, price, rating, reviews_count,
	images, banner_image, banner_image_mobile, materials, sizes, is_featured, is_active,
	stock_quantity, in_stock, created_at, updated_at`

func InsertProduct(ctx context.Context, p *models.Product) error {
	images, _ := marshalJSON(p.Images)
	materials, _ := marshalJSON(p.Materials)
	sizes, _ := marshalJSON(p.Sizes)
	var catID any
	if p.CategoryID != "" {
		catID = p.CategoryID
	}
	_, err := lib.DB().Exec(ctx, `
		INSERT INTO products (`+productCols+`)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
	`, p.ID, p.Name, p.Description, p.Category, catID, p.CostPrice, p.Price, p.Rating, p.ReviewsCount,
		images, p.BannerImage, p.BannerImageMobile, materials, sizes,
		p.IsFeatured, p.IsActive, p.StockQuantity, p.InStock, p.CreatedAt, p.UpdatedAt)
	return err
}

func FindProductByID(ctx context.Context, id string) (*models.Product, error) {
	row := lib.DB().QueryRow(ctx, `SELECT `+productCols+` FROM products WHERE id=$1`, id)
	p, err := scanProduct(row)
	if isNoRows(err) {
		return nil, nil
	}
	return p, err
}

func FindProductByName(ctx context.Context, name string) (*models.Product, error) {
	row := lib.DB().QueryRow(ctx, `SELECT `+productCols+` FROM products WHERE name=$1`, name)
	p, err := scanProduct(row)
	if isNoRows(err) {
		return nil, nil
	}
	return p, err
}

func DeleteProduct(ctx context.Context, id string) (*models.Product, error) {
	row := lib.DB().QueryRow(ctx, `DELETE FROM products WHERE id=$1 RETURNING `+productCols, id)
	p, err := scanProduct(row)
	if isNoRows(err) {
		return nil, nil
	}
	return p, err
}

func UpdateProduct(ctx context.Context, p *models.Product) error {
	images, _ := marshalJSON(p.Images)
	materials, _ := marshalJSON(p.Materials)
	sizes, _ := marshalJSON(p.Sizes)
	var catID any
	if p.CategoryID != "" {
		catID = p.CategoryID
	}
	tag, err := lib.DB().Exec(ctx, `
		UPDATE products SET name=$2, description=$3, category=$4, category_id=$5,
			cost_price=$6, price=$7, materials=$8, sizes=$9, images=$10,
			banner_image=$11, banner_image_mobile=$12, is_featured=$13, is_active=$14,
			stock_quantity=$15, in_stock=$16, updated_at=$17
		WHERE id=$1
	`, p.ID, p.Name, p.Description, p.Category, catID, p.CostPrice, p.Price,
		materials, sizes, images, p.BannerImage, p.BannerImageMobile,
		p.IsFeatured, p.IsActive, p.StockQuantity, p.InStock, p.UpdatedAt)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

func DeductProductStock(ctx context.Context, productID string, quantity int) error {
	tag, err := lib.DB().Exec(ctx, `
		UPDATE products SET
			stock_quantity = stock_quantity - $2,
			in_stock = (stock_quantity - $2) > 0,
			updated_at = $3
		WHERE id = $1 AND stock_quantity >= $2
	`, productID, quantity, time.Now())
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("insufficient stock")
	}
	return nil
}

type ProductFilter struct {
	ActiveCategories []string
	Search           string
	Category         string
	MaxPrice         float64
	ExcludeID        string
	FeaturedOnly     bool
	InStockOnly      bool
	ProductIDs       []string
	AdminSearch      string
}

func ListProducts(ctx context.Context, filter ProductFilter, skip, limit int, sortSQL string) ([]models.Product, int64, error) {
	where, args := productWhere(filter)
	countQ := `SELECT COUNT(*) FROM products WHERE ` + where
	var total int64
	if err := lib.DB().QueryRow(ctx, countQ, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	if sortSQL == "" {
		sortSQL = "created_at DESC"
	}
	q := `SELECT ` + productCols + ` FROM products WHERE ` + where + ` ORDER BY ` + sortSQL
	if limit > 0 {
		argN := len(args) + 1
		q += fmt.Sprintf(` OFFSET $%d LIMIT $%d`, argN, argN+1)
		args = append(args, skip, limit)
	} else if skip > 0 {
		argN := len(args) + 1
		q += fmt.Sprintf(` OFFSET $%d`, argN)
		args = append(args, skip)
	}
	items, _, err := queryProducts(ctx, q, args...)
	return items, total, err
}

func ListAllProducts(ctx context.Context, sortSQL string) ([]models.Product, error) {
	if sortSQL == "" {
		sortSQL = "created_at DESC"
	}
	items, _, err := queryProducts(ctx, `SELECT `+productCols+` FROM products ORDER BY `+sortSQL)
	return items, err
}

func CountFeaturedProducts(ctx context.Context) (int64, error) {
	var n int64
	err := lib.DB().QueryRow(ctx, `SELECT COUNT(*) FROM products WHERE is_featured=TRUE`).Scan(&n)
	return n, err
}

func MaxProductPrice(ctx context.Context, filter ProductFilter) (float64, error) {
	where, args := productWhere(filter)
	var max float64
	err := lib.DB().QueryRow(ctx, `SELECT COALESCE(MAX(price),0) FROM products WHERE `+where, args...).Scan(&max)
	return max, err
}

func CountLowStockProducts(ctx context.Context) (int64, error) {
	var n int64
	err := lib.DB().QueryRow(ctx, `
		SELECT COUNT(*) FROM products WHERE in_stock=FALSE OR (stock_quantity > 0 AND stock_quantity <= 5)
	`).Scan(&n)
	return n, err
}

func productWhere(filter ProductFilter) (string, []any) {
	parts := []string{"1=1"}
	args := []any{}
	n := 1

	if len(filter.ActiveCategories) > 0 {
		parts = append(parts, fmt.Sprintf(`category = ANY($%d)`, n))
		args = append(args, filter.ActiveCategories)
		n++
		parts = append(parts, `COALESCE(is_active, TRUE)=TRUE`)
		parts = append(parts, `images <> '[]'::jsonb`)
		parts = append(parts, `images->>0 IS NOT NULL AND images->>0 <> ''`)
	}
	if filter.FeaturedOnly {
		parts = append(parts, `is_featured=TRUE`)
	}
	if filter.InStockOnly {
		parts = append(parts, `in_stock=TRUE`)
	}
	if filter.Category != "" && filter.Category != "All" {
		parts = append(parts, fmt.Sprintf(`category=$%d`, n))
		args = append(args, filter.Category)
		n++
	}
	if filter.MaxPrice > 0 {
		parts = append(parts, fmt.Sprintf(`price <= $%d`, n))
		args = append(args, filter.MaxPrice)
		n++
	}
	if filter.ExcludeID != "" {
		parts = append(parts, fmt.Sprintf(`id <> $%d`, n))
		args = append(args, filter.ExcludeID)
		n++
	}
	if filter.Search != "" {
		parts = append(parts, fmt.Sprintf(`(name ILIKE $%d OR description ILIKE $%d OR materials::text ILIKE $%d)`, n, n, n))
		args = append(args, "%"+filter.Search+"%")
		n++
	}
	if filter.AdminSearch != "" {
		parts = append(parts, fmt.Sprintf(`(name ILIKE $%d OR category ILIKE $%d)`, n, n))
		args = append(args, "%"+filter.AdminSearch+"%")
		n++
	}
	if len(filter.ProductIDs) > 0 {
		parts = append(parts, fmt.Sprintf(`id = ANY($%d)`, n))
		args = append(args, filter.ProductIDs)
		n++
	}
	return strings.Join(parts, " AND "), args
}

func queryProducts(ctx context.Context, q string, args ...any) ([]models.Product, int64, error) {
	rows, err := lib.DB().Query(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	var out []models.Product
	for rows.Next() {
		var p models.Product
		var imagesJSON, materialsJSON, sizesJSON []byte
		var categoryID *string
		var isActive *bool
		if err := rows.Scan(
			&p.ID, &p.Name, &p.Description, &p.Category, &categoryID,
			&p.CostPrice, &p.Price, &p.Rating, &p.ReviewsCount,
			&imagesJSON, &p.BannerImage, &p.BannerImageMobile,
			&materialsJSON, &sizesJSON,
			&p.IsFeatured, &isActive, &p.StockQuantity, &p.InStock,
			&p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		if categoryID != nil {
			p.CategoryID = *categoryID
		}
		p.IsActive = isActive
		_ = scanJSON(imagesJSON, &p.Images)
		_ = scanJSON(materialsJSON, &p.Materials)
		_ = scanJSON(sizesJSON, &p.Sizes)
		out = append(out, p)
	}
	return out, int64(len(out)), rows.Err()
}

func AdminProductSortSQL(sortBy string, dir int) string {
	dirSQL := "DESC"
	if dir > 0 {
		dirSQL = "ASC"
	}
	switch sortBy {
	case "name":
		return "name " + dirSQL
	case "category":
		return "category " + dirSQL
	case "costPrice":
		return "cost_price " + dirSQL
	case "price":
		return "price " + dirSQL
	case "stock":
		return "stock_quantity " + dirSQL
	case "featured":
		return "is_featured " + dirSQL
	case "status":
		return "is_active " + dirSQL + " NULLS LAST"
	case "updatedAt":
		return "updated_at " + dirSQL
	case "margin":
		return "(price - cost_price) " + dirSQL
	default:
		return "created_at " + dirSQL
	}
}

func CustomerProductSortSQL(sortBy string) string {
	switch sortBy {
	case "price-low":
		return "price ASC"
	case "price-high":
		return "price DESC"
	case "rating":
		return "rating DESC, created_at DESC"
	case "newest":
		return "created_at DESC"
	default:
		return "is_featured DESC, rating DESC, created_at DESC"
	}
}

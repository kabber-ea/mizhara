package services

import (
	"context"
	"strconv"
	"strings"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"
	"mizhara-backend/store"
	"mizhara-backend/utils"
)

type SerializedProduct struct {
	ID                string   `json:"id"`
	Name              string   `json:"name"`
	Description       string   `json:"description"`
	Category          string   `json:"category"`
	Price             float64  `json:"price"`
	Rating            float64  `json:"rating"`
	ReviewsCount      int      `json:"reviewsCount"`
	Images            []string `json:"images"`
	BannerImage       string   `json:"bannerImage,omitempty"`
	BannerImageMobile string   `json:"bannerImageMobile,omitempty"`
	Materials         []string `json:"materials"`
	Sizes             []string `json:"sizes"`
	IsFeatured        bool     `json:"isFeatured"`
	IsActive          bool     `json:"isActive"`
	StockQuantity     int      `json:"stockQuantity"`
	InStock           bool     `json:"inStock"`
	UpdatedAt         string   `json:"updatedAt"`
}

type AdminProduct struct {
	SerializedProduct
	CostPrice float64 `json:"costPrice"`
}

type ProductInput struct {
	ID                string   `json:"id,omitempty"`
	Name              string   `json:"name"`
	Description       string   `json:"description"`
	Category          string   `json:"category"`
	CostPrice         float64  `json:"costPrice"`
	Price             float64  `json:"price"`
	Rating            float64  `json:"rating"`
	ReviewsCount      int      `json:"reviewsCount"`
	Images            []string `json:"images"`
	BannerImage       string   `json:"bannerImage,omitempty"`
	BannerImageMobile string   `json:"bannerImageMobile,omitempty"`
	Materials         []string `json:"materials"`
	Sizes             []string `json:"sizes"`
	IsFeatured        bool     `json:"isFeatured"`
	IsActive          *bool    `json:"isActive,omitempty"`
	StockQuantity     int      `json:"stockQuantity"`
	InStock           bool     `json:"inStock"`
}

func productIsActive(p models.Product) bool {
	if p.IsActive == nil {
		return true
	}
	return *p.IsActive
}

func resolveProductCategory(ctx context.Context, categoryName string) (string, string, error) {
	name := strings.TrimSpace(categoryName)
	if name == "" {
		return "", "", utils.BadRequest("category is required")
	}
	cat, err := store.FindCategoryByName(ctx, name)
	if err != nil {
		return "", "", err
	}
	if cat == nil {
		return "", "", utils.BadRequest("invalid category")
	}
	return cat.ID, cat.Name, nil
}

func productVisibleToCustomer(p models.Product, activeCategoryNames []string) bool {
	if !productIsActive(p) {
		return false
	}
	if len(activeCategoryNames) == 0 {
		return false
	}
	for _, name := range activeCategoryNames {
		if p.Category == name {
			return true
		}
	}
	return false
}

func productUpdatedAt(p models.Product) time.Time {
	if !p.UpdatedAt.IsZero() {
		return p.UpdatedAt
	}
	if !p.CreatedAt.IsZero() {
		return p.CreatedAt
	}
	return time.Now()
}

func serializeProduct(p models.Product) SerializedProduct {
	stock := p.StockQuantity
	if stock <= 0 && p.InStock {
		stock = 1
	}
	return SerializedProduct{
		ID: p.ID, Name: p.Name, Description: p.Description, Category: p.Category,
		Price: p.Price, Rating: p.Rating, ReviewsCount: p.ReviewsCount,
		Images: p.Images, BannerImage: p.BannerImage, BannerImageMobile: p.BannerImageMobile,
		Materials: p.Materials, Sizes: p.Sizes,
		IsFeatured: p.IsFeatured, IsActive: productIsActive(p), StockQuantity: stock, InStock: syncInStock(stock),
		UpdatedAt: productUpdatedAt(p).Format(time.RFC3339),
	}
}

func serializeAdminProduct(p models.Product) AdminProduct {
	return AdminProduct{SerializedProduct: serializeProduct(p), CostPrice: p.CostPrice}
}

func customerFilter(activeCats []string) store.ProductFilter {
	return store.ProductFilter{ActiveCategories: activeCats}
}

func ListProductsForViewer(ctx context.Context, session *lib.SessionPayload) (interface{}, error) {
	if session != nil && session.Role == lib.RoleAdmin {
		return ListAdminProducts(ctx)
	}
	return ListProducts(ctx)
}

func CreateProductForAdmin(ctx context.Context, session *lib.SessionPayload, input ProductInput) (*AdminProduct, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	return CreateProduct(ctx, input)
}

func UpdateProductForAdmin(ctx context.Context, session *lib.SessionPayload, input ProductInput) (*AdminProduct, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	item, err := UpdateProduct(ctx, input)
	if err != nil {
		return nil, err
	}
	if item == nil {
		return nil, utils.ErrNotFound
	}
	return item, nil
}

func DeleteProductForAdmin(ctx context.Context, session *lib.SessionPayload, id string) (*SerializedProduct, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	item, err := DeleteProduct(ctx, id)
	if err != nil {
		return nil, err
	}
	if item == nil {
		return nil, utils.ErrNotFound
	}
	return item, nil
}

func ListProducts(ctx context.Context) ([]SerializedProduct, error) {
	activeCats, err := ListActiveCategoryNames(ctx)
	if err != nil {
		return nil, err
	}
	products, _, err := store.ListProducts(ctx, customerFilter(activeCats), 0, 0, store.CustomerProductSortSQL(""))
	if err != nil {
		return nil, err
	}
	out := make([]SerializedProduct, 0, len(products))
	for _, p := range products {
		out = append(out, serializeProduct(p))
	}
	return out, nil
}

func ListAdminProducts(ctx context.Context) ([]AdminProduct, error) {
	products, err := store.ListAllProducts(ctx, "created_at DESC")
	if err != nil {
		return nil, err
	}
	out := make([]AdminProduct, 0, len(products))
	for _, p := range products {
		out = append(out, serializeAdminProduct(p))
	}
	return out, nil
}

func ListCustomerProductsPaginated(ctx context.Context, pageStr, limitStr, search, category, maxPriceStr, sortBy, offerIDsStr string) (map[string]interface{}, error) {
	activeCats, err := ListActiveCategoryNames(ctx)
	if err != nil {
		return nil, err
	}
	p := utils.ParsePagination(pageStr, limitStr, search)
	filter := customerFilter(activeCats)
	filter.Search = p.Search
	if category != "" && category != "All" {
		filter.Category = category
	}
	if maxPriceStr != "" {
		if maxPrice, err := strconv.ParseFloat(maxPriceStr, 64); err == nil && maxPrice > 0 {
			filter.MaxPrice = maxPrice
		}
	}
	if offerIDsStr != "" {
		ids, err := BuildProductFilterForOffers(ctx, strings.Split(offerIDsStr, ","))
		if err != nil {
			return nil, err
		}
		if ids != nil {
			filter.ProductIDs = ids
		}
	}

	products, total, err := store.ListProducts(ctx, filter, p.Skip, p.Limit, store.CustomerProductSortSQL(sortBy))
	if err != nil {
		return nil, err
	}
	maxPrice, _ := store.MaxProductPrice(ctx, customerFilter(activeCats))

	items := make([]SerializedProduct, 0, len(products))
	for _, prod := range products {
		items = append(items, serializeProduct(prod))
	}
	return map[string]interface{}{
		"items":      items,
		"pagination": utils.BuildPaginationMeta(p.Page, p.Limit, int(total)),
		"maxPrice":   maxPrice,
	}, nil
}

var adminProductSortFields = map[string]string{
	"name": "name", "category": "category", "costPrice": "costPrice", "price": "price",
	"stock": "stock", "featured": "featured", "status": "status",
	"createdAt": "createdAt", "updatedAt": "updatedAt",
}

func ListAdminProductsPaginated(ctx context.Context, session *lib.SessionPayload, page, limit, search, sortBy, sortDir string) (map[string]interface{}, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	p := utils.ParsePagination(page, limit, search)
	filter := store.ProductFilter{AdminSearch: p.Search}
	sort := utils.ParseSort(sortBy, sortDir, adminProductSortFields, "createdAt")
	products, total, err := store.ListProducts(ctx, filter, p.Skip, p.Limit, store.AdminProductSortSQL(sort.Field, sort.Dir))
	if err != nil {
		return nil, err
	}
	featuredCount, _ := store.CountFeaturedProducts(ctx)
	items := make([]AdminProduct, 0, len(products))
	for _, prod := range products {
		items = append(items, serializeAdminProduct(prod))
	}
	return map[string]interface{}{
		"items": items, "pagination": utils.BuildPaginationMeta(p.Page, p.Limit, int(total)),
		"featuredCount": int(featuredCount),
	}, nil
}

func prepareProductInput(input ProductInput) ProductInput {
	input.BannerImage = strings.TrimSpace(input.BannerImage)
	input.BannerImageMobile = strings.TrimSpace(input.BannerImageMobile)
	if input.BannerImage == "" || input.BannerImageMobile == "" {
		input.IsFeatured = false
	}
	return input
}

func validateProductInput(input ProductInput) error {
	if input.Name == "" || input.Category == "" || input.Price <= 0 {
		return utils.BadRequest("name, category, and price are required")
	}
	if len(input.Images) == 0 || input.Images[0] == "" {
		return utils.BadRequest("at least one product image is required")
	}
	if input.IsFeatured && (input.BannerImage == "" || input.BannerImageMobile == "") {
		return utils.BadRequest("desktop and mobile banner images are required for featured products")
	}
	return nil
}

func GetFeaturedProducts(ctx context.Context, limit int64) ([]SerializedProduct, error) {
	activeCats, _ := ListActiveCategoryNames(ctx)
	filter := customerFilter(activeCats)
	filter.FeaturedOnly = true
	products, _, err := store.ListProducts(ctx, filter, 0, int(limit), "created_at DESC")
	if err != nil {
		return []SerializedProduct{}, nil
	}
	out := make([]SerializedProduct, 0, len(products))
	for _, p := range products {
		out = append(out, serializeProduct(p))
	}
	return out, nil
}

func GetNewProducts(ctx context.Context, limit int64) ([]SerializedProduct, error) {
	if limit == 0 {
		limit = 8
	}
	activeCats, _ := ListActiveCategoryNames(ctx)
	filter := customerFilter(activeCats)
	filter.InStockOnly = true
	products, _, err := store.ListProducts(ctx, filter, 0, int(limit), "created_at DESC")
	if err != nil {
		return []SerializedProduct{}, nil
	}
	out := make([]SerializedProduct, 0, len(products))
	for _, p := range products {
		out = append(out, serializeProduct(p))
	}
	return out, nil
}

func GetTrendingProducts(ctx context.Context, limit int64) ([]SerializedProduct, error) {
	if limit == 0 {
		limit = 8
	}
	activeCats, _ := ListActiveCategoryNames(ctx)
	filter := customerFilter(activeCats)
	filter.InStockOnly = true
	products, _, err := store.ListProducts(ctx, filter, 0, int(limit), "reviews_count DESC, rating DESC, created_at DESC")
	if err != nil {
		return []SerializedProduct{}, nil
	}
	out := make([]SerializedProduct, 0, len(products))
	for _, p := range products {
		out = append(out, serializeProduct(p))
	}
	return out, nil
}

func GetProductByIDForViewer(ctx context.Context, id string, session *lib.SessionPayload) (*SerializedProduct, error) {
	p, err := findProductByID(ctx, id)
	if err != nil || p == nil {
		return nil, err
	}
	isAdmin := session != nil && session.Role == lib.RoleAdmin
	if !isAdmin {
		activeCats, err := ListActiveCategoryNames(ctx)
		if err != nil {
			return nil, err
		}
		if !productVisibleToCustomer(*p, activeCats) {
			return nil, nil
		}
	}
	s := serializeProduct(*p)
	return &s, nil
}

func findProductByID(ctx context.Context, id string) (*models.Product, error) {
	if !lib.ValidID(id) {
		return nil, nil
	}
	return store.FindProductByID(ctx, id)
}

func GetRelatedProducts(ctx context.Context, category, excludeID string, limit int64) ([]SerializedProduct, error) {
	if limit == 0 {
		limit = 4
	}
	activeCats, err := ListActiveCategoryNames(ctx)
	if err != nil {
		return nil, err
	}
	categoryActive := false
	for _, name := range activeCats {
		if name == category {
			categoryActive = true
			break
		}
	}
	if !categoryActive {
		return []SerializedProduct{}, nil
	}
	filter := customerFilter(activeCats)
	filter.Category = category
	filter.ExcludeID = excludeID
	products, _, err := store.ListProducts(ctx, filter, 0, int(limit), "")
	if err != nil {
		return nil, err
	}
	out := make([]SerializedProduct, 0, len(products))
	for _, p := range products {
		out = append(out, serializeProduct(p))
	}
	return out, nil
}

func CreateProduct(ctx context.Context, input ProductInput) (*AdminProduct, error) {
	input = prepareProductInput(input)
	if err := validateProductInput(input); err != nil {
		return nil, err
	}
	categoryID, categoryName, err := resolveProductCategory(ctx, input.Category)
	if err != nil {
		return nil, err
	}
	now := time.Now()
	sizes := input.Sizes
	if len(sizes) == 0 {
		sizes = []string{"One Size"}
	}
	stock := input.StockQuantity
	if stock <= 0 && input.InStock {
		stock = 10
	}
	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}
	p := models.Product{
		ID: lib.NewID(), Name: input.Name, Description: input.Description,
		Category: categoryName, CategoryID: categoryID, CostPrice: input.CostPrice, Price: input.Price,
		Rating: input.Rating, ReviewsCount: input.ReviewsCount,
		Images: input.Images, BannerImage: input.BannerImage, BannerImageMobile: input.BannerImageMobile,
		Materials: input.Materials, Sizes: sizes,
		IsFeatured: input.IsFeatured, IsActive: boolPtr(isActive), StockQuantity: stock, InStock: syncInStock(stock),
		CreatedAt: now, UpdatedAt: now,
	}
	if p.Rating == 0 {
		p.Rating = 4.5
	}
	if err := store.InsertProduct(ctx, &p); err != nil {
		return nil, err
	}
	result := serializeAdminProduct(p)
	return &result, nil
}

func UpdateProduct(ctx context.Context, input ProductInput) (*AdminProduct, error) {
	input = prepareProductInput(input)
	if err := validateProductInput(input); err != nil {
		return nil, err
	}
	if !lib.ValidID(input.ID) {
		return nil, nil
	}
	categoryID, categoryName, err := resolveProductCategory(ctx, input.Category)
	if err != nil {
		return nil, err
	}
	existing, err := store.FindProductByID(ctx, input.ID)
	if err != nil || existing == nil {
		return nil, err
	}
	stock := input.StockQuantity
	if stock < 0 {
		stock = 0
	}
	existing.Name = input.Name
	existing.Description = input.Description
	existing.Category = categoryName
	existing.CategoryID = categoryID
	existing.CostPrice = input.CostPrice
	existing.Price = input.Price
	existing.Materials = input.Materials
	existing.Sizes = input.Sizes
	existing.Images = input.Images
	existing.BannerImage = input.BannerImage
	existing.BannerImageMobile = input.BannerImageMobile
	existing.IsFeatured = input.IsFeatured
	existing.StockQuantity = stock
	existing.InStock = syncInStock(stock)
	existing.UpdatedAt = time.Now()
	if input.IsActive != nil {
		existing.IsActive = input.IsActive
	}
	if err := store.UpdateProduct(ctx, existing); err != nil {
		return nil, err
	}
	result := serializeAdminProduct(*existing)
	return &result, nil
}

func DeleteProduct(ctx context.Context, id string) (*SerializedProduct, error) {
	if !lib.ValidID(id) {
		return nil, nil
	}
	p, err := store.DeleteProduct(ctx, id)
	if err != nil || p == nil {
		return nil, err
	}
	s := serializeProduct(*p)
	return &s, nil
}

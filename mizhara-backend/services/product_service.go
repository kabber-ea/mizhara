package services

import (
	"context"
	"errors"
	"regexp"
	"strconv"
	"strings"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type SerializedProduct struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Description  string   `json:"description"`
	Category     string   `json:"category"`
	Price        float64  `json:"price"`
	Rating       float64  `json:"rating"`
	ReviewsCount int      `json:"reviewsCount"`
	Images       []string `json:"images"`
	BannerImage       string   `json:"bannerImage,omitempty"`
	BannerImageMobile string   `json:"bannerImageMobile,omitempty"`
	Materials    []string `json:"materials"`
	Sizes        []string `json:"sizes"`
	IsFeatured    bool     `json:"isFeatured"`
	IsActive      bool     `json:"isActive"`
	StockQuantity int      `json:"stockQuantity"`
	InStock       bool     `json:"inStock"`
	UpdatedAt     string   `json:"updatedAt"`
}

type AdminProduct struct {
	SerializedProduct
	CostPrice float64 `json:"costPrice"`
}

type ProductInput struct {
	ID           string   `json:"id,omitempty"`
	Name         string   `json:"name"`
	Description  string   `json:"description"`
	Category     string   `json:"category"`
	CostPrice    float64  `json:"costPrice"`
	Price        float64  `json:"price"`
	Rating       float64  `json:"rating"`
	ReviewsCount int      `json:"reviewsCount"`
	Images       []string `json:"images"`
	BannerImage       string   `json:"bannerImage,omitempty"`
	BannerImageMobile string   `json:"bannerImageMobile,omitempty"`
	Materials    []string `json:"materials"`
	Sizes        []string `json:"sizes"`
	IsFeatured    bool     `json:"isFeatured"`
	IsActive      *bool    `json:"isActive,omitempty"`
	StockQuantity int      `json:"stockQuantity"`
	InStock       bool     `json:"inStock"`
}

func productIsActive(p models.Product) bool {
	if p.IsActive == nil {
		return true
	}
	return *p.IsActive
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

func customerProductBaseFilter(activeCategoryNames []string) bson.M {
	filter := bson.M{
		"images.0": bson.M{"$exists": true, "$ne": ""},
		"isActive": bson.M{"$ne": false},
	}
	if len(activeCategoryNames) > 0 {
		filter["category"] = bson.M{"$in": activeCategoryNames}
	} else {
		filter["category"] = bson.M{"$in": []string{}}
	}
	return filter
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
		ID: p.ID.Hex(), Name: p.Name, Description: p.Description, Category: p.Category,
		Price: p.Price, Rating: p.Rating, ReviewsCount: p.ReviewsCount,
		Images: p.Images, BannerImage: p.BannerImage, BannerImageMobile: p.BannerImageMobile, Materials: p.Materials, Sizes: p.Sizes,
		IsFeatured: p.IsFeatured, IsActive: productIsActive(p), StockQuantity: stock, InStock: syncInStock(stock),
		UpdatedAt: productUpdatedAt(p).Format(time.RFC3339),
	}
}

func serializeAdminProduct(p models.Product) AdminProduct {
	return AdminProduct{SerializedProduct: serializeProduct(p), CostPrice: p.CostPrice}
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
		return nil, lib.ErrNotFound
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
		return nil, lib.ErrNotFound
	}
	return item, nil
}

func ListProducts(ctx context.Context) ([]SerializedProduct, error) {
	activeCats, err := ListActiveCategoryNames(ctx)
	if err != nil {
		return nil, err
	}
	cur, err := lib.Products().Find(ctx, customerProductBaseFilter(activeCats), options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var out []SerializedProduct
	for cur.Next(ctx) {
		var p models.Product
		if err := cur.Decode(&p); err != nil {
			return nil, err
		}
		out = append(out, serializeProduct(p))
	}
	return out, nil
}

func ListAdminProducts(ctx context.Context) ([]AdminProduct, error) {
	cur, err := lib.Products().Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var out []AdminProduct
	for cur.Next(ctx) {
		var p models.Product
		if err := cur.Decode(&p); err != nil {
			return nil, err
		}
		out = append(out, serializeAdminProduct(p))
	}
	return out, nil
}

func ListCustomerProductsPaginated(ctx context.Context, pageStr, limitStr, search, category, maxPriceStr, sortBy, offerIDsStr string) (map[string]interface{}, error) {
	activeCats, err := ListActiveCategoryNames(ctx)
	if err != nil {
		return nil, err
	}
	baseFilter := customerProductBaseFilter(activeCats)
	p := lib.ParsePagination(pageStr, limitStr, search)

	match := bson.M{"$and": bson.A{baseFilter}}
	if category != "" && category != "All" {
		match["$and"] = append(match["$and"].(bson.A), bson.M{"category": category})
	}
	if maxPriceStr != "" {
		if maxPrice, err := strconv.ParseFloat(maxPriceStr, 64); err == nil && maxPrice > 0 {
			match["$and"] = append(match["$and"].(bson.A), bson.M{"price": bson.M{"$lte": maxPrice}})
		}
	}
	if p.Search != "" {
		escaped := regexp.QuoteMeta(p.Search)
		match["$and"] = append(match["$and"].(bson.A), bson.M{"$or": bson.A{
			bson.M{"name": bson.M{"$regex": escaped, "$options": "i"}},
			bson.M{"description": bson.M{"$regex": escaped, "$options": "i"}},
			bson.M{"materials": bson.M{"$regex": escaped, "$options": "i"}},
		}})
	}
	if offerIDsStr != "" {
		offerFilter, err := BuildProductFilterForOffers(ctx, strings.Split(offerIDsStr, ","))
		if err != nil {
			return nil, err
		}
		if offerFilter != nil {
			match["$and"] = append(match["$and"].(bson.A), offerFilter)
		}
	}

	sort := customerProductSort(sortBy)
	total, _ := lib.Products().CountDocuments(ctx, match)
	maxPrice, _ := customerCatalogMaxPrice(ctx, baseFilter)

	cur, err := lib.Products().Find(ctx, match,
		options.Find().
			SetSort(sort).
			SetSkip(int64(p.Skip)).
			SetLimit(int64(p.Limit)),
	)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var items []SerializedProduct
	for cur.Next(ctx) {
		var prod models.Product
		if err := cur.Decode(&prod); err != nil {
			return nil, err
		}
		items = append(items, serializeProduct(prod))
	}
	if items == nil {
		items = []SerializedProduct{}
	}

	return map[string]interface{}{
		"items": items,
		"pagination": lib.BuildPaginationMeta(p.Page, p.Limit, int(total)),
		"maxPrice": maxPrice,
	}, nil
}

func customerProductSort(sortBy string) bson.D {
	switch sortBy {
	case "price-low":
		return bson.D{{Key: "price", Value: 1}}
	case "price-high":
		return bson.D{{Key: "price", Value: -1}}
	case "rating":
		return bson.D{{Key: "rating", Value: -1}, {Key: "createdAt", Value: -1}}
	case "newest":
		return bson.D{{Key: "createdAt", Value: -1}}
	default:
		return bson.D{{Key: "isFeatured", Value: -1}, {Key: "rating", Value: -1}, {Key: "createdAt", Value: -1}}
	}
}

func customerCatalogMaxPrice(ctx context.Context, baseFilter bson.M) (float64, error) {
	pipeline := bson.A{
		bson.M{"$match": baseFilter},
		bson.M{"$group": bson.M{"_id": nil, "maxPrice": bson.M{"$max": "$price"}}},
	}
	cur, err := lib.Products().Aggregate(ctx, pipeline)
	if err != nil {
		return 0, err
	}
	defer cur.Close(ctx)
	if !cur.Next(ctx) {
		return 0, nil
	}
	var result struct {
		MaxPrice float64 `bson:"maxPrice"`
	}
	if err := cur.Decode(&result); err != nil {
		return 0, err
	}
	return result.MaxPrice, nil
}

var adminProductSortFields = map[string]string{
	"name":       "name",
	"category":   "category",
	"costPrice":  "costPrice",
	"price":      "price",
	"stock":      "stockQuantity",
	"featured":   "isFeatured",
	"status":     "isActive",
	"createdAt":  "createdAt",
	"updatedAt":  "updatedAt",
}

func ListAdminProductsPaginated(ctx context.Context, session *lib.SessionPayload, page, limit, search, sortBy, sortDir string) (map[string]interface{}, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	p := lib.ParsePagination(page, limit, search)
	match := bson.M{}
	if p.Search != "" {
		escaped := regexp.QuoteMeta(p.Search)
		match["$or"] = bson.A{
			bson.M{"name": bson.M{"$regex": escaped, "$options": "i"}},
			bson.M{"category": bson.M{"$regex": escaped, "$options": "i"}},
		}
	}

	sort := lib.ParseSort(sortBy, sortDir, adminProductSortFields, "createdAt")
	total, _ := lib.Products().CountDocuments(ctx, match)
	featuredCount, _ := lib.Products().CountDocuments(ctx, bson.M{"isFeatured": true})

	var items []AdminProduct
	var err error
	if sortBy == "margin" {
		items, err = listAdminProductsSortedByMargin(ctx, match, p.Skip, p.Limit, sort.Dir)
	} else {
		items, err = listAdminProductsFind(ctx, match, p.Skip, p.Limit, sort)
	}
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"items":         items,
		"pagination":    lib.BuildPaginationMeta(p.Page, p.Limit, int(total)),
		"featuredCount": int(featuredCount),
	}, nil
}

func listAdminProductsFind(ctx context.Context, match bson.M, skip, limit int, sort lib.SortParams) ([]AdminProduct, error) {
	cur, err := lib.Products().Find(ctx, match,
		options.Find().
			SetSort(bson.D{{Key: sort.Field, Value: sort.Dir}}).
			SetSkip(int64(skip)).
			SetLimit(int64(limit)),
	)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	return decodeAdminProducts(ctx, cur)
}

func listAdminProductsSortedByMargin(ctx context.Context, match bson.M, skip, limit, dir int) ([]AdminProduct, error) {
	pipeline := bson.A{
		bson.M{"$match": match},
		bson.M{"$addFields": bson.M{"margin": bson.M{"$subtract": bson.A{"$price", "$costPrice"}}}},
		bson.M{"$sort": bson.D{{Key: "margin", Value: dir}}},
		bson.M{"$skip": skip},
		bson.M{"$limit": limit},
	}
	cur, err := lib.Products().Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	return decodeAdminProducts(ctx, cur)
}

func decodeAdminProducts(ctx context.Context, cur *mongo.Cursor) ([]AdminProduct, error) {
	var out []AdminProduct
	for cur.Next(ctx) {
		var p models.Product
		if err := cur.Decode(&p); err != nil {
			return nil, err
		}
		out = append(out, serializeAdminProduct(p))
	}
	return out, nil
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
		return lib.BadRequest("name, category, and price are required")
	}
	if len(input.Images) == 0 || input.Images[0] == "" {
		return lib.BadRequest("at least one product image is required")
	}
	if input.IsFeatured && (input.BannerImage == "" || input.BannerImageMobile == "") {
		return lib.BadRequest("desktop and mobile banner images are required for featured products")
	}
	return nil
}

func GetFeaturedProducts(ctx context.Context, limit int64) ([]SerializedProduct, error) {
	activeCats, err := ListActiveCategoryNames(ctx)
	if err != nil {
		return []SerializedProduct{}, nil
	}
	filter := customerProductBaseFilter(activeCats)
	filter["isFeatured"] = true
	findOpts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	if limit > 0 {
		findOpts.SetLimit(limit)
	}
	cur, err := lib.Products().Find(ctx, filter, findOpts)
	if err != nil {
		return []SerializedProduct{}, nil
	}
	defer cur.Close(ctx)
	var out []SerializedProduct
	for cur.Next(ctx) {
		var p models.Product
		_ = cur.Decode(&p)
		out = append(out, serializeProduct(p))
	}
	return out, nil
}

func GetNewProducts(ctx context.Context, limit int64) ([]SerializedProduct, error) {
	if limit == 0 {
		limit = 8
	}
	activeCats, err := ListActiveCategoryNames(ctx)
	if err != nil {
		return []SerializedProduct{}, nil
	}
	filter := customerProductBaseFilter(activeCats)
	filter["inStock"] = true
	cur, err := lib.Products().Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetLimit(limit))
	if err != nil {
		return []SerializedProduct{}, nil
	}
	defer cur.Close(ctx)
	var out []SerializedProduct
	for cur.Next(ctx) {
		var p models.Product
		_ = cur.Decode(&p)
		out = append(out, serializeProduct(p))
	}
	return out, nil
}

func GetTrendingProducts(ctx context.Context, limit int64) ([]SerializedProduct, error) {
	if limit == 0 {
		limit = 8
	}
	activeCats, err := ListActiveCategoryNames(ctx)
	if err != nil {
		return []SerializedProduct{}, nil
	}
	filter := customerProductBaseFilter(activeCats)
	filter["inStock"] = true
	cur, err := lib.Products().Find(ctx, filter, options.Find().SetSort(bson.D{
		{Key: "reviewsCount", Value: -1},
		{Key: "rating", Value: -1},
		{Key: "createdAt", Value: -1},
	}).SetLimit(limit))
	if err != nil {
		return []SerializedProduct{}, nil
	}
	defer cur.Close(ctx)
	var out []SerializedProduct
	for cur.Next(ctx) {
		var p models.Product
		_ = cur.Decode(&p)
		out = append(out, serializeProduct(p))
	}
	return out, nil
}

func GetProductByIDForViewer(ctx context.Context, id string, session *lib.SessionPayload) (*SerializedProduct, error) {
	p, err := findProductByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, nil
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
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, nil
	}
	var p models.Product
	err = lib.Products().FindOne(ctx, bson.M{"_id": oid}).Decode(&p)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
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
	filter := customerProductBaseFilter(activeCats)
	filter["category"] = category
	if oid, err := primitive.ObjectIDFromHex(excludeID); err == nil {
		filter["_id"] = bson.M{"$ne": oid}
	}
	cur, err := lib.Products().Find(ctx, filter, options.Find().SetLimit(limit))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var out []SerializedProduct
	for cur.Next(ctx) {
		var p models.Product
		_ = cur.Decode(&p)
		out = append(out, serializeProduct(p))
	}
	return out, nil
}

func CreateProduct(ctx context.Context, input ProductInput) (*AdminProduct, error) {
	input = prepareProductInput(input)
	if err := validateProductInput(input); err != nil {
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
		ID: primitive.NewObjectID(), Name: input.Name, Description: input.Description,
		Category: input.Category, CostPrice: input.CostPrice, Price: input.Price,
		Rating: input.Rating, ReviewsCount: input.ReviewsCount,
		Images: input.Images, BannerImage: input.BannerImage, BannerImageMobile: input.BannerImageMobile, Materials: input.Materials, Sizes: sizes,
		IsFeatured: input.IsFeatured, IsActive: boolPtr(isActive), StockQuantity: stock, InStock: syncInStock(stock),
		CreatedAt: now, UpdatedAt: now,
	}
	if p.Rating == 0 {
		p.Rating = 4.5
	}
	_, err := lib.Products().InsertOne(ctx, p)
	if err != nil {
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
	oid, err := primitive.ObjectIDFromHex(input.ID)
	if err != nil {
		return nil, nil
	}
	stock := input.StockQuantity
	if stock < 0 {
		stock = 0
	}
	update := bson.M{
		"name": input.Name, "description": input.Description, "category": input.Category,
		"costPrice": input.CostPrice, "price": input.Price, "materials": input.Materials,
		"sizes": input.Sizes, "images": input.Images, "bannerImage": input.BannerImage, "bannerImageMobile": input.BannerImageMobile, "isFeatured": input.IsFeatured,
		"stockQuantity": stock, "inStock": syncInStock(stock), "updatedAt": time.Now(),
	}
	if input.IsActive != nil {
		update["isActive"] = *input.IsActive
	}
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var p models.Product
	err = lib.Products().FindOneAndUpdate(ctx, bson.M{"_id": oid}, bson.M{"$set": update}, opts).Decode(&p)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	result := serializeAdminProduct(p)
	return &result, nil
}

func DeleteProduct(ctx context.Context, id string) (*SerializedProduct, error) {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, nil
	}
	var p models.Product
	err = lib.Products().FindOneAndDelete(ctx, bson.M{"_id": oid}).Decode(&p)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	s := serializeProduct(p)
	return &s, nil
}

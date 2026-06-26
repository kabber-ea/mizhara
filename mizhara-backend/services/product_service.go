package services

import (
	"context"
	"errors"
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
	Materials    []string `json:"materials"`
	Sizes        []string `json:"sizes"`
	IsFeatured    bool     `json:"isFeatured"`
	StockQuantity int      `json:"stockQuantity"`
	InStock       bool     `json:"inStock"`
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
	Materials    []string `json:"materials"`
	Sizes        []string `json:"sizes"`
	IsFeatured    bool     `json:"isFeatured"`
	StockQuantity int      `json:"stockQuantity"`
	InStock       bool     `json:"inStock"`
}

func serializeProduct(p models.Product) SerializedProduct {
	stock := p.StockQuantity
	if stock <= 0 && p.InStock {
		stock = 1
	}
	return SerializedProduct{
		ID: p.ID.Hex(), Name: p.Name, Description: p.Description, Category: p.Category,
		Price: p.Price, Rating: p.Rating, ReviewsCount: p.ReviewsCount,
		Images: p.Images, Materials: p.Materials, Sizes: p.Sizes,
		IsFeatured: p.IsFeatured, StockQuantity: stock, InStock: syncInStock(stock),
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
	cur, err := lib.Products().Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
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

func GetFeaturedProducts(ctx context.Context, limit int64) ([]SerializedProduct, error) {
	if limit == 0 {
		limit = 4
	}
	cur, err := lib.Products().Find(ctx, bson.M{"isFeatured": true, "inStock": true},
		options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetLimit(limit))
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

func GetProductByID(ctx context.Context, id string) (*SerializedProduct, error) {
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
	s := serializeProduct(p)
	return &s, nil
}

func GetRelatedProducts(ctx context.Context, category, excludeID string, limit int64) ([]SerializedProduct, error) {
	if limit == 0 {
		limit = 4
	}
	filter := bson.M{"category": category, "inStock": true}
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
	now := time.Now()
	sizes := input.Sizes
	if len(sizes) == 0 {
		sizes = []string{"One Size"}
	}
	stock := input.StockQuantity
	if stock <= 0 && input.InStock {
		stock = 10
	}
	p := models.Product{
		ID: primitive.NewObjectID(), Name: input.Name, Description: input.Description,
		Category: input.Category, CostPrice: input.CostPrice, Price: input.Price,
		Rating: input.Rating, ReviewsCount: input.ReviewsCount,
		Images: input.Images, Materials: input.Materials, Sizes: sizes,
		IsFeatured: input.IsFeatured, StockQuantity: stock, InStock: syncInStock(stock),
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
		"sizes": input.Sizes, "images": input.Images, "isFeatured": input.IsFeatured,
		"stockQuantity": stock, "inStock": syncInStock(stock), "updatedAt": time.Now(),
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

package services

import (
	"context"
	"errors"
	"fmt"
	"math"
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

type SerializedOffer struct {
	ID           string     `json:"id"`
	Name         string     `json:"name"`
	Description  string     `json:"description"`
	Image        string     `json:"image,omitempty"`
	Type         string     `json:"type"`
	Scope        string     `json:"scope"`
	Percentage   float64    `json:"percentage,omitempty"`
	FixedAmount  float64    `json:"fixedAmount,omitempty"`
	MinPurchase  float64    `json:"minPurchase,omitempty"`
	MaxDiscount  float64    `json:"maxDiscount,omitempty"`
	BuyQuantity  int        `json:"buyQuantity,omitempty"`
	FreeQuantity int        `json:"freeQuantity,omitempty"`
	ProductIDs   []string   `json:"productIds,omitempty"`
	Code         string     `json:"code,omitempty"`
	IsActive     bool       `json:"isActive"`
	StartsAt     *time.Time `json:"startsAt,omitempty"`
	EndsAt       *time.Time `json:"endsAt,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
}

type OfferInput struct {
	ID           string     `json:"id,omitempty"`
	Name         string     `json:"name"`
	Description  string     `json:"description"`
	Image        string     `json:"image"`
	Type         string     `json:"type"`
	Scope        string     `json:"scope"`
	Percentage   float64    `json:"percentage"`
	FixedAmount  float64    `json:"fixedAmount"`
	MinPurchase  float64    `json:"minPurchase"`
	MaxDiscount  float64    `json:"maxDiscount"`
	BuyQuantity  int        `json:"buyQuantity"`
	FreeQuantity int        `json:"freeQuantity"`
	ProductIDs   []string   `json:"productIds"`
	Code         string     `json:"code"`
	IsActive     bool       `json:"isActive"`
	StartsAt     *time.Time `json:"startsAt,omitempty"`
	EndsAt       *time.Time `json:"endsAt,omitempty"`
}

type CartLineInput struct {
	ProductID string  `json:"productId"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price,omitempty"`
}

type OfferPreviewInput struct {
	Items     []CartLineInput `json:"items"`
	OfferID   string          `json:"offerId,omitempty"`
	OfferCode string          `json:"offerCode,omitempty"`
}

type OfferPreviewResult struct {
	Subtotal       float64 `json:"subtotal"`
	DiscountAmount float64 `json:"discountAmount"`
	Total          float64 `json:"total"`
	OfferID        string  `json:"offerId,omitempty"`
	OfferName      string  `json:"offerName,omitempty"`
	OfferLabel     string  `json:"offerLabel,omitempty"`
}

type resolvedLine struct {
	productID string
	name      string
	price     float64
	quantity  int
	image     string
	category  string
}

func offerIsActive(o models.Offer) bool {
	if o.IsActive == nil {
		return true
	}
	return *o.IsActive
}

func serializeOffer(o models.Offer) SerializedOffer {
	productIDs := o.ProductIDs
	if productIDs == nil {
		productIDs = []string{}
	}
	return SerializedOffer{
		ID: o.ID.Hex(), Name: o.Name, Description: o.Description, Image: o.Image,
		Type: string(o.Type), Scope: string(o.Scope),
		Percentage: o.Percentage, FixedAmount: o.FixedAmount,
		MinPurchase: o.MinPurchase, MaxDiscount: o.MaxDiscount,
		BuyQuantity: o.BuyQuantity, FreeQuantity: o.FreeQuantity,
		ProductIDs: productIDs, Code: o.Code, IsActive: offerIsActive(o),
		StartsAt: o.StartsAt, EndsAt: o.EndsAt,
		CreatedAt: o.CreatedAt, UpdatedAt: o.UpdatedAt,
	}
}

func offerIsLive(o models.Offer, now time.Time) bool {
	if !offerIsActive(o) {
		return false
	}
	if o.StartsAt != nil && now.Before(*o.StartsAt) {
		return false
	}
	if o.EndsAt != nil && now.After(*o.EndsAt) {
		return false
	}
	return true
}

func validateOfferInput(input OfferInput) error {
	name := strings.TrimSpace(input.Name)
	if name == "" {
		return lib.BadRequest("offer name is required")
	}
	typ := models.OfferType(input.Type)
	if typ != models.OfferTypePercentage && typ != models.OfferTypeFixed && typ != models.OfferTypeBogo {
		return lib.BadRequest("offer type must be percentage, fixed, or bogo")
	}
	scope := models.OfferScope(input.Scope)
	if scope != models.OfferScopeAll && scope != models.OfferScopeSelected {
		return lib.BadRequest("scope must be all or selected")
	}
	if scope == models.OfferScopeSelected && len(input.ProductIDs) == 0 {
		return lib.BadRequest("select at least one product for this offer")
	}
	if typ == models.OfferTypePercentage {
		if input.Percentage <= 0 || input.Percentage > 100 {
			return lib.BadRequest("percentage must be between 1 and 100")
		}
	}
	if typ == models.OfferTypeFixed {
		if input.FixedAmount <= 0 {
			return lib.BadRequest("fixed discount amount must be greater than 0")
		}
	}
	if typ == models.OfferTypeBogo {
		if input.BuyQuantity <= 0 || input.FreeQuantity <= 0 {
			return lib.BadRequest("buy and free quantities must be at least 1")
		}
	}
	if input.MinPurchase < 0 {
		return lib.BadRequest("minimum purchase cannot be negative")
	}
	if input.MaxDiscount < 0 {
		return lib.BadRequest("maximum discount cannot be negative")
	}
	if typ != models.OfferTypePercentage && input.MaxDiscount > 0 {
		return lib.BadRequest("maximum discount applies to percentage offers only")
	}
	if typ == models.OfferTypeBogo {
		if input.MinPurchase > 0 {
			return lib.BadRequest("minimum purchase applies to percentage and fixed offers only")
		}
		if input.MaxDiscount > 0 {
			return lib.BadRequest("maximum discount applies to percentage offers only")
		}
	}
	return nil
}

func ListOffersForAdmin(ctx context.Context, session *lib.SessionPayload) ([]SerializedOffer, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	cur, err := lib.Offers().Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var out []SerializedOffer
	for cur.Next(ctx) {
		var o models.Offer
		if err := cur.Decode(&o); err != nil {
			return nil, err
		}
		out = append(out, serializeOffer(o))
	}
	if out == nil {
		out = []SerializedOffer{}
	}
	return out, nil
}

func CreateOfferForAdmin(ctx context.Context, session *lib.SessionPayload, input OfferInput) (*SerializedOffer, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	if err := validateOfferInput(input); err != nil {
		return nil, err
	}
	now := time.Now()
	o := models.Offer{
		ID: primitive.NewObjectID(), Name: strings.TrimSpace(input.Name),
		Description: strings.TrimSpace(input.Description), Image: strings.TrimSpace(input.Image),
		Type: models.OfferType(input.Type), Scope: models.OfferScope(input.Scope),
		Percentage: input.Percentage, FixedAmount: input.FixedAmount,
		MinPurchase: input.MinPurchase, MaxDiscount: input.MaxDiscount,
		BuyQuantity: input.BuyQuantity, FreeQuantity: input.FreeQuantity,
		ProductIDs: input.ProductIDs, Code: strings.ToUpper(strings.TrimSpace(input.Code)),
		IsActive: boolPtr(input.IsActive), StartsAt: input.StartsAt, EndsAt: input.EndsAt,
		CreatedAt: now, UpdatedAt: now,
	}
	if _, err := lib.Offers().InsertOne(ctx, o); err != nil {
		return nil, err
	}
	result := serializeOffer(o)
	return &result, nil
}

func UpdateOfferForAdmin(ctx context.Context, session *lib.SessionPayload, input OfferInput) (*SerializedOffer, error) {
	if err := RequireAdmin(session); err != nil {
		return nil, err
	}
	if err := validateOfferInput(input); err != nil {
		return nil, err
	}
	oid, err := primitive.ObjectIDFromHex(input.ID)
	if err != nil {
		return nil, lib.ErrNotFound
	}
	update := bson.M{
		"name": strings.TrimSpace(input.Name), "description": strings.TrimSpace(input.Description),
		"image": strings.TrimSpace(input.Image),
		"type": input.Type, "scope": input.Scope,
		"percentage": input.Percentage, "fixedAmount": input.FixedAmount,
		"minPurchase": input.MinPurchase, "maxDiscount": input.MaxDiscount,
		"buyQuantity": input.BuyQuantity, "freeQuantity": input.FreeQuantity,
		"productIds": input.ProductIDs, "code": strings.ToUpper(strings.TrimSpace(input.Code)),
		"isActive": input.IsActive, "startsAt": input.StartsAt, "endsAt": input.EndsAt,
		"updatedAt": time.Now(),
	}
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var o models.Offer
	err = lib.Offers().FindOneAndUpdate(ctx, bson.M{"_id": oid}, bson.M{"$set": update}, opts).Decode(&o)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, lib.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	result := serializeOffer(o)
	return &result, nil
}

func DeleteOfferForAdmin(ctx context.Context, session *lib.SessionPayload, id string) error {
	if err := RequireAdmin(session); err != nil {
		return err
	}
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return lib.ErrNotFound
	}
	res, err := lib.Offers().DeleteOne(ctx, bson.M{"_id": oid})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return lib.ErrNotFound
	}
	return nil
}

func ListActiveOffers(ctx context.Context) ([]SerializedOffer, error) {
	now := time.Now()
	cur, err := lib.Offers().Find(ctx, bson.M{"isActive": bson.M{"$ne": false}}, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		return []SerializedOffer{}, nil
	}
	defer cur.Close(ctx)
	var out []SerializedOffer
	for cur.Next(ctx) {
		var o models.Offer
		if err := cur.Decode(&o); err != nil {
			continue
		}
		if offerIsLive(o, now) {
			out = append(out, serializeOffer(o))
		}
	}
	if out == nil {
		out = []SerializedOffer{}
	}
	return out, nil
}

func PreviewOffer(ctx context.Context, input OfferPreviewInput) (*OfferPreviewResult, error) {
	lines, subtotal, err := resolveCartLines(ctx, input.Items)
	if err != nil {
		return nil, err
	}
	if len(lines) == 0 {
		return &OfferPreviewResult{}, nil
	}

	offer, err := pickOffer(ctx, input.OfferID, input.OfferCode, lines)
	if err != nil {
		return nil, err
	}

	discount := 0.0
	var offerID, offerName, offerLabel string
	if offer != nil {
		discount = calculateOfferDiscount(*offer, lines)
		offerID = offer.ID.Hex()
		offerName = offer.Name
		offerLabel = describeOffer(*offer)
	}

	total := math.Max(0, subtotal-discount)
	return &OfferPreviewResult{
		Subtotal: roundMoney(subtotal), DiscountAmount: roundMoney(discount),
		Total: roundMoney(total), OfferID: offerID, OfferName: offerName, OfferLabel: offerLabel,
	}, nil
}

func ResolveOrderPricing(ctx context.Context, items []CartLineInput, offerID, offerCode string) ([]models.OrderItem, float64, float64, float64, string, string, error) {
	lines, subtotal, err := resolveCartLines(ctx, items)
	if err != nil {
		return nil, 0, 0, 0, "", "", err
	}
	offer, err := pickOffer(ctx, offerID, offerCode, lines)
	if err != nil {
		return nil, 0, 0, 0, "", "", err
	}

	discount := 0.0
	var oid, oname string
	if offer != nil {
		discount = calculateOfferDiscount(*offer, lines)
		oid = offer.ID.Hex()
		oname = offer.Name
	}
	total := math.Max(0, subtotal-discount)

	orderItems := make([]models.OrderItem, len(lines))
	for i, line := range lines {
		orderItems[i] = models.OrderItem{
			ProductID: line.productID, Name: line.name, Price: line.price,
			Quantity: line.quantity, Size: "Standard", Image: line.image, Category: line.category,
		}
	}
	return orderItems, roundMoney(subtotal), roundMoney(discount), roundMoney(total), oid, oname, nil
}

func resolveCartLines(ctx context.Context, items []CartLineInput) ([]resolvedLine, float64, error) {
	var lines []resolvedLine
	subtotal := 0.0
	for _, item := range items {
		if item.ProductID == "" || item.Quantity <= 0 {
			continue
		}
		oid, err := primitive.ObjectIDFromHex(item.ProductID)
		if err != nil {
			return nil, 0, lib.BadRequest("invalid product in cart")
		}
		var p models.Product
		err = lib.Products().FindOne(ctx, bson.M{"_id": oid}).Decode(&p)
		if err != nil {
			return nil, 0, lib.BadRequest("product no longer available")
		}
		price := p.Price
		image := ""
		if len(p.Images) > 0 {
			image = p.Images[0]
		}
		line := resolvedLine{
			productID: p.ID.Hex(), name: p.Name, price: price,
			quantity: item.Quantity, image: image, category: p.Category,
		}
		lines = append(lines, line)
		subtotal += price * float64(item.Quantity)
	}
	return lines, subtotal, nil
}

func pickOffer(ctx context.Context, offerID, offerCode string, lines []resolvedLine) (*models.Offer, error) {
	now := time.Now()
	code := strings.ToUpper(strings.TrimSpace(offerCode))

	if code != "" {
		if strings.TrimSpace(offerID) != "" {
			return nil, lib.BadRequest("apply either a coupon code or an auto offer, not both")
		}
		var o models.Offer
		err := lib.Offers().FindOne(ctx, bson.M{"code": code, "isActive": bson.M{"$ne": false}}).Decode(&o)
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, lib.BadRequest("invalid or expired offer code")
		}
		if err != nil {
			return nil, err
		}
		if !offerIsLive(o, now) {
			return nil, lib.BadRequest("this offer is no longer active")
		}
		if err := validateOfferMinPurchase(o, lines); err != nil {
			return nil, err
		}
		return &o, nil
	}

	if offerID != "" {
		oid, err := primitive.ObjectIDFromHex(offerID)
		if err != nil {
			return nil, lib.BadRequest("invalid offer")
		}
		var o models.Offer
		err = lib.Offers().FindOne(ctx, bson.M{"_id": oid, "isActive": bson.M{"$ne": false}}).Decode(&o)
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, lib.BadRequest("offer is no longer available")
		}
		if err != nil {
			return nil, err
		}
		if !offerIsLive(o, now) {
			return nil, lib.BadRequest("offer is no longer active")
		}
		if err := validateOfferMinPurchase(o, lines); err != nil {
			return nil, err
		}
		return &o, nil
	}

	cur, err := lib.Offers().Find(ctx, bson.M{"isActive": bson.M{"$ne": false}, "$or": []bson.M{
		{"code": ""}, {"code": bson.M{"$exists": false}},
	}})
	if err != nil {
		return nil, nil
	}
	defer cur.Close(ctx)

	var best *models.Offer
	bestDiscount := 0.0
	for cur.Next(ctx) {
		var o models.Offer
		if err := cur.Decode(&o); err != nil || !offerIsLive(o, now) {
			continue
		}
		if strings.TrimSpace(o.Code) != "" {
			continue
		}
		d := calculateOfferDiscount(o, lines)
		if d > bestDiscount {
			bestDiscount = d
			copy := o
			best = &copy
		}
	}
	return best, nil
}

func lineEligible(o models.Offer, productID string) bool {
	if o.Scope == models.OfferScopeAll {
		return true
	}
	for _, id := range o.ProductIDs {
		if id == productID {
			return true
		}
	}
	return false
}

func eligibleSubtotal(o models.Offer, lines []resolvedLine) float64 {
	eligible := 0.0
	for _, line := range lines {
		if lineEligible(o, line.productID) {
			eligible += line.price * float64(line.quantity)
		}
	}
	return eligible
}

func validateOfferMinPurchase(o models.Offer, lines []resolvedLine) error {
	if o.MinPurchase <= 0 {
		return nil
	}
	if o.Type != models.OfferTypePercentage && o.Type != models.OfferTypeFixed {
		return nil
	}
	eligible := eligibleSubtotal(o, lines)
	if eligible < o.MinPurchase {
		return lib.BadRequest(fmt.Sprintf("minimum eligible purchase of ₹%.0f required for this offer", o.MinPurchase))
	}
	return nil
}

func calculateOfferDiscount(o models.Offer, lines []resolvedLine) float64 {
	switch o.Type {
	case models.OfferTypePercentage:
		eligible := eligibleSubtotal(o, lines)
		if o.MinPurchase > 0 && eligible < o.MinPurchase {
			return 0
		}
		discount := eligible * o.Percentage / 100
		if o.MaxDiscount > 0 && discount > o.MaxDiscount {
			discount = o.MaxDiscount
		}
		return discount
	case models.OfferTypeFixed:
		eligible := eligibleSubtotal(o, lines)
		if o.MinPurchase > 0 && eligible < o.MinPurchase {
			return 0
		}
		discount := o.FixedAmount
		if discount > eligible {
			discount = eligible
		}
		return discount
	case models.OfferTypeBogo:
		discount := 0.0
		bundle := o.BuyQuantity + o.FreeQuantity
		if bundle <= 0 {
			return 0
		}
		for _, line := range lines {
			if !lineEligible(o, line.productID) {
				continue
			}
			sets := line.quantity / bundle
			freeItems := sets * o.FreeQuantity
			discount += float64(freeItems) * line.price
		}
		return discount
	default:
		return 0
	}
}

func describeOffer(o models.Offer) string {
	switch o.Type {
	case models.OfferTypePercentage:
		if o.Scope == models.OfferScopeAll {
			return formatPct(o.Percentage) + " off all items" + offerConstraintSuffix(o)
		}
		return formatPct(o.Percentage) + " off selected items" + offerConstraintSuffix(o)
	case models.OfferTypeFixed:
		label := "₹" + formatMoney(o.FixedAmount) + " off"
		if o.Scope == models.OfferScopeSelected {
			label += " selected items"
		} else {
			label += " all items"
		}
		return label + offerConstraintSuffix(o)
	case models.OfferTypeBogo:
		label := "Buy " + itoa(o.BuyQuantity) + " get " + itoa(o.FreeQuantity) + " free"
		if o.Scope == models.OfferScopeSelected {
			return label + " on selected items"
		}
		return label
	default:
		return o.Name
	}
}

func formatPct(v float64) string {
	if v == math.Trunc(v) {
		return strconv.Itoa(int(v)) + "%"
	}
	return strings.TrimRight(strings.TrimRight(fmt.Sprintf("%.1f", v), "0"), ".") + "%"
}

func formatMoney(v float64) string {
	if v == math.Trunc(v) {
		return strconv.Itoa(int(v))
	}
	return strings.TrimRight(strings.TrimRight(fmt.Sprintf("%.0f", v), "0"), ".")
}

func offerConstraintSuffix(o models.Offer) string {
	parts := []string{}
	if o.MinPurchase > 0 {
		parts = append(parts, "min ₹"+formatMoney(o.MinPurchase))
	}
	if o.Type == models.OfferTypePercentage && o.MaxDiscount > 0 {
		parts = append(parts, "up to ₹"+formatMoney(o.MaxDiscount))
	}
	if len(parts) == 0 {
		return ""
	}
	return " (" + strings.Join(parts, ", ") + ")"
}

func itoa(n int) string {
	return strconv.Itoa(n)
}

func roundMoney(v float64) float64 {
	return math.Round(v*100) / 100
}

package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"mizhara-backend/lib"
	"mizhara-backend/models"
	"mizhara-backend/scripts/seed"
	"mizhara-backend/store"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	skipImages := flag.Bool("skip-images", false, "skip Cloudinary uploads (products will have no images)")
	ifEmpty := flag.Bool("if-empty", false, "skip when the database already has products")
	imgDir := flag.String("img-dir", "", "path to img folder (default: scripts/seed/img)")
	flag.Parse()

	_ = godotenv.Load()
	if err := lib.ConnectDB(); err != nil {
		log.Fatal(err)
	}

	ctx := context.Background()

	if *ifEmpty {
		products, _, err := store.ListProducts(ctx, store.ProductFilter{}, 0, 1, "")
		if err != nil {
			log.Fatal(err)
		}
		if len(products) > 0 {
			log.Printf("Database already has products; skipping seed (--if-empty)")
			return
		}
	}

	categories, err := seed.LoadCategories()
	if err != nil {
		log.Fatal(err)
	}
	customers, err := seed.LoadCustomers()
	if err != nil {
		log.Fatal(err)
	}
	products, err := seed.LoadProducts()
	if err != nil {
		log.Fatal(err)
	}
	offers, err := seed.LoadOffers()
	if err != nil {
		log.Fatal(err)
	}

	resolvedImgDir, err := seed.ResolveImgDir(*imgDir)
	if err != nil && !*skipImages {
		log.Fatal(err)
	}

	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	log.Println("Clearing existing data...")
	_, _ = lib.DB().Exec(ctx, `TRUNCATE orders, offers, products, categories, users CASCADE`)

	adminEmail := envOr("ADMIN_EMAIL", "admin@mizhara.in")
	adminPassword := envOr("ADMIN_PASSWORD", "Admin@123")
	customerPassword := envOr("CUSTOMER_PASSWORD", "Customer@123")

	now := time.Now()
	adminHash, _ := bcrypt.GenerateFromPassword([]byte(adminPassword), 10)
	customerHash, _ := bcrypt.GenerateFromPassword([]byte(customerPassword), 10)

	admin := models.User{
		ID: lib.NewID(), Name: "Mizhara Admin", Email: strings.ToLower(adminEmail),
		Password: string(adminHash), Role: models.RoleAdmin, CreatedAt: now, UpdatedAt: now,
	}
	_ = store.InsertUser(ctx, &admin)

	demoCustomerEmail := strings.ToLower(envOr("CUSTOMER_EMAIL", "customer@mizhara.in"))
	demoCustomerPhone := envOr("CUSTOMER_PHONE", "9876543210")
	demoCustomerID := lib.NewID()
	demoCustomer := models.User{
		ID: demoCustomerID, Name: "Demo Customer", Email: demoCustomerEmail,
		Phone: demoCustomerPhone, Password: string(customerHash), Role: models.RoleCustomer,
		CreatedAt: now, UpdatedAt: now,
	}

	customerIDs := []string{demoCustomerID}
	customerProfiles := map[string]seed.CustomerSeed{
		demoCustomerID: {Name: "Demo Customer", Email: demoCustomerEmail, Phone: demoCustomerPhone},
	}
	_ = store.InsertUser(ctx, &demoCustomer)
	log.Printf("Demo customer login: %s / %s", demoCustomerEmail, customerPassword)

	for _, c := range customers {
		if strings.ToLower(c.Email) == demoCustomerEmail {
			continue
		}
		id := lib.NewID()
		customerIDs = append(customerIDs, id)
		customerProfiles[id] = c
		createdAt := now.AddDate(0, 0, -rng.Intn(180))
		_ = store.InsertUser(ctx, &models.User{
			ID: id, Name: c.Name, Email: strings.ToLower(c.Email),
			Phone: c.Phone, Password: string(customerHash), Role: models.RoleCustomer,
			CreatedAt: createdAt, UpdatedAt: createdAt,
		})
	}

	categoryIDs := make(map[string]string)
	for _, cat := range categories {
		isActive := true
		catID := lib.NewID()
		_ = store.InsertCategory(ctx, &models.Category{
			ID: catID, Name: cat.Name,
			Slug: strings.ToLower(strings.ReplaceAll(cat.Name, " ", "-")),
			IsActive: &isActive, CreatedAt: now, UpdatedAt: now,
		})
		categoryIDs[cat.Name] = catID
	}

	productIDs := make([]string, 0, len(products))
	productByID := make(map[string]models.Product)
	productByName := make(map[string]string)

	for _, p := range products {
		id := lib.NewID()
		productIDs = append(productIDs, id)
		productByName[p.Name] = id
		isActive := true
		createdAt := now.AddDate(0, 0, -rng.Intn(90))

		var images []string
		var bannerImage, bannerImageMobile string

		if !*skipImages {
			log.Printf("Uploading images for %q...", p.Name)
			urls, err := seed.UploadProductImages(ctx, resolvedImgDir, p.Name)
			if err != nil {
				log.Fatalf("image upload for %q: %v", p.Name, err)
			}
			images = urls.Images
			bannerImage = urls.BannerImage
			bannerImageMobile = urls.BannerImageMobile
		}

		doc := models.Product{
			ID: id, Name: p.Name, Description: p.Description,
			Category: p.Category, CategoryID: categoryIDs[p.Category], CostPrice: p.CostPrice, Price: p.Price,
			Rating: p.Rating, ReviewsCount: p.ReviewsCount,
			Images: images, BannerImage: bannerImage, BannerImageMobile: bannerImageMobile,
			Materials: p.Materials, Sizes: p.Sizes, IsFeatured: p.IsFeatured,
			IsActive: &isActive,
			StockQuantity: p.StockQuantity, InStock: p.StockQuantity > 0,
			CreatedAt: createdAt, UpdatedAt: now,
		}
		productByID[id] = doc
		_ = store.InsertProduct(ctx, &doc)
	}

	builtOffers := seed.BuildOffers(now, offers, products, productByName)
	for _, o := range builtOffers {
		_ = store.InsertOffer(ctx, &o)
	}

	deliveryStatuses := []models.DeliveryStatus{
		models.DeliveryProcessing, models.DeliveryShipped,
		models.DeliveryDelivered, models.DeliveryDelivered,
	}

	expensiveProductIDs := sortedProductIDsByPrice(productByID, true)
	affordableProductIDs := sortedProductIDsByPrice(productByID, false)

	orderCount := 0
	for ci, customerID := range customerIDs {
		paidOrders := paidOrdersForCustomer(ci, rng)
		for o := 0; o < paidOrders; o++ {
			productID := pickProductForTier(ci, rng, expensiveProductIDs, affordableProductIDs, productIDs)
			orderCount += insertSeedOrder(ctx, rng, orderCount, customerID, customerProfiles, productByID, productID, ci, now, models.PaymentPaid, deliveryStatuses)
		}
	}

	fmt.Println("Seed complete!")
	fmt.Printf("  Admin:         %s / %s\n", adminEmail, adminPassword)
	fmt.Printf("  Categories:    %d\n", len(categories))
	fmt.Printf("  Products:      %d\n", len(products))
	fmt.Printf("  Offers:        %d\n", len(offers))
	fmt.Printf("  Customers:     %d\n", len(customerIDs))
	fmt.Printf("  Orders:        %d\n", orderCount)
	fmt.Printf("  Demo customer: %s / %s\n", demoCustomerEmail, customerPassword)
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func paidOrdersForCustomer(customerIndex int, rng *rand.Rand) int {
	switch {
	case customerIndex < 8:
		return 12 + rng.Intn(7)
	case customerIndex < 20:
		return 4 + rng.Intn(4)
	case customerIndex < 35:
		return 1 + rng.Intn(3)
	default:
		return rng.Intn(2)
	}
}

func sortedProductIDsByPrice(productByID map[string]models.Product, descending bool) []string {
	ids := make([]string, 0, len(productByID))
	for id := range productByID {
		ids = append(ids, id)
	}
	for i := 0; i < len(ids); i++ {
		for j := i + 1; j < len(ids); j++ {
			left := productByID[ids[i]].Price
			right := productByID[ids[j]].Price
			swap := descending && left < right
			if !descending && left > right {
				swap = true
			}
			if swap {
				ids[i], ids[j] = ids[j], ids[i]
			}
		}
	}
	return ids
}

func pickProductForTier(customerIndex int, rng *rand.Rand, expensive, affordable, all []string) string {
	switch {
	case customerIndex < 8:
		limit := min(8, len(expensive))
		return expensive[rng.Intn(limit)]
	case customerIndex < 20:
		if rng.Intn(3) == 0 && len(affordable) > 0 {
			limit := min(12, len(affordable))
			return affordable[rng.Intn(limit)]
		}
		return all[rng.Intn(len(all))]
	default:
		return all[rng.Intn(len(all))]
	}
}

func orderQuantityForTier(customerIndex int, rng *rand.Rand) int {
	switch {
	case customerIndex < 8:
		return 1 + rng.Intn(3)
	case customerIndex < 20:
		return 1 + rng.Intn(2)
	default:
		return 1
	}
}

func insertSeedOrder(
	ctx context.Context, rng *rand.Rand, orderCount int,
	customerID string, customerProfiles map[string]seed.CustomerSeed,
	productByID map[string]models.Product, productID string,
	customerIndex int, now time.Time,
	paymentStatus models.PaymentStatus, deliveryStatuses []models.DeliveryStatus,
) int {
	product := productByID[productID]
	qty := orderQuantityForTier(customerIndex, rng)
	subtotal := product.Price * float64(qty)
	daysAgo := rng.Intn(90)
	createdAt := now.AddDate(0, 0, -daysAgo).Add(-time.Duration(rng.Intn(86400)) * time.Second)
	deliveryStatus := deliveryStatuses[rng.Intn(len(deliveryStatuses))]
	customer := customerProfiles[customerID]
	itemImage := ""
	if len(product.Images) > 0 {
		itemImage = product.Images[0]
	}
	itemSize := "One Size"
	if len(product.Sizes) > 0 {
		itemSize = product.Sizes[0]
	}

	order := models.Order{
		ID: lib.NewID(), UserID: customerID,
		OrderNumber: fmt.Sprintf("MIZ-%06d", 100000+orderCount),
		Items: []models.OrderItem{{
			ProductID: productID, Name: product.Name, Price: product.Price,
			Quantity: qty, Size: itemSize, Image: itemImage, Category: product.Category,
		}},
		ShippingAddress: models.ShippingAddress{
			Name: customer.Name, Email: customer.Email, Phone: customer.Phone,
			Address: fmt.Sprintf("%d, MG Road", 10+rng.Intn(200)),
			City: "Mumbai", State: "Maharashtra", Pincode: "400001",
		},
		Subtotal: subtotal, Shipping: 0, Total: subtotal, Currency: "INR",
		PaymentStatus: paymentStatus, DeliveryStatus: deliveryStatus,
		CreatedAt: createdAt, UpdatedAt: createdAt,
	}
	if paymentStatus == models.PaymentPaid && deliveryStatus == models.DeliveryDelivered {
		delivered := createdAt.AddDate(0, 0, 3+rng.Intn(5))
		order.DeliveredAt = &delivered
	}
	_ = store.InsertOrder(ctx, &order)
	return 1
}

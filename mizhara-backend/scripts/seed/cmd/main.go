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
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
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
		count, err := lib.Products().CountDocuments(ctx, bson.M{})
		if err != nil {
			log.Fatal(err)
		}
		if count > 0 {
			log.Printf("Database already has %d product(s); skipping seed (--if-empty)", count)
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
	_, _ = lib.Users().DeleteMany(ctx, bson.M{})
	_, _ = lib.Categories().DeleteMany(ctx, bson.M{})
	_, _ = lib.Products().DeleteMany(ctx, bson.M{})
	_, _ = lib.Orders().DeleteMany(ctx, bson.M{})
	_, _ = lib.Offers().DeleteMany(ctx, bson.M{})

	adminEmail := envOr("ADMIN_EMAIL", "admin@mizhara.in")
	adminPassword := envOr("ADMIN_PASSWORD", "Admin@123")
	customerPassword := envOr("CUSTOMER_PASSWORD", "Customer@123")

	now := time.Now()
	adminHash, _ := bcrypt.GenerateFromPassword([]byte(adminPassword), 10)
	customerHash, _ := bcrypt.GenerateFromPassword([]byte(customerPassword), 10)

	admin := models.User{
		ID: primitive.NewObjectID(), Name: "Mizhara Admin", Email: strings.ToLower(adminEmail),
		Password: string(adminHash), Role: models.RoleAdmin, CreatedAt: now, UpdatedAt: now,
	}
	_, _ = lib.Users().InsertOne(ctx, admin)

	demoCustomerEmail := strings.ToLower(envOr("CUSTOMER_EMAIL", "customer@mizhara.in"))
	demoCustomerPhone := envOr("CUSTOMER_PHONE", "9876543210")
	demoCustomerID := primitive.NewObjectID()
	demoCustomer := models.User{
		ID: demoCustomerID, Name: "Demo Customer", Email: demoCustomerEmail,
		Phone: demoCustomerPhone, Password: string(customerHash), Role: models.RoleCustomer,
		CreatedAt: now, UpdatedAt: now,
	}

	customerDocs := []interface{}{demoCustomer}
	customerIDs := []primitive.ObjectID{demoCustomerID}
	customerProfiles := map[primitive.ObjectID]seed.CustomerSeed{
		demoCustomerID: {Name: "Demo Customer", Email: demoCustomerEmail, Phone: demoCustomerPhone},
	}
	log.Printf("Demo customer login: %s / %s", demoCustomerEmail, customerPassword)

	for _, c := range customers {
		if strings.ToLower(c.Email) == demoCustomerEmail {
			continue
		}
		id := primitive.NewObjectID()
		customerIDs = append(customerIDs, id)
		customerProfiles[id] = c
		createdAt := now.AddDate(0, 0, -rng.Intn(180))
		customerDocs = append(customerDocs, models.User{
			ID: id, Name: c.Name, Email: strings.ToLower(c.Email),
			Phone: c.Phone, Password: string(customerHash), Role: models.RoleCustomer,
			CreatedAt: createdAt, UpdatedAt: createdAt,
		})
	}
	_, _ = lib.Users().InsertMany(ctx, customerDocs)

	for _, cat := range categories {
		isActive := true
		_, _ = lib.Categories().InsertOne(ctx, models.Category{
			ID: primitive.NewObjectID(), Name: cat.Name,
			Slug: strings.ToLower(strings.ReplaceAll(cat.Name, " ", "-")),
			IsActive: &isActive, CreatedAt: now, UpdatedAt: now,
		})
	}

	productIDs := make([]primitive.ObjectID, 0, len(products))
	productByID := make(map[primitive.ObjectID]models.Product)
	productByName := make(map[string]primitive.ObjectID)

	for _, p := range products {
		id := primitive.NewObjectID()
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
			if p.IsFeatured && (bannerImage == "" || bannerImageMobile == "") {
				log.Printf("  warning: %q is featured but banner image(s) missing in img folder", p.Name)
			}
		}

		doc := models.Product{
			ID: id, Name: p.Name, Description: p.Description,
			Category: p.Category, CostPrice: p.CostPrice, Price: p.Price,
			Rating: p.Rating, ReviewsCount: p.ReviewsCount,
			Images: images, BannerImage: bannerImage, BannerImageMobile: bannerImageMobile,
			Materials: p.Materials, Sizes: p.Sizes, IsFeatured: p.IsFeatured,
			IsActive: &isActive,
			StockQuantity: p.StockQuantity, InStock: p.StockQuantity > 0,
			CreatedAt: createdAt, UpdatedAt: now,
		}
		productByID[id] = doc
		_, _ = lib.Products().InsertOne(ctx, doc)
	}

	offerDocs := make([]interface{}, len(offers))
	builtOffers := seed.BuildOffers(now, offers, products, productByName)
	for i, o := range builtOffers {
		offerDocs[i] = o
	}
	_, _ = lib.Offers().InsertMany(ctx, offerDocs)

	deliveryStatuses := []models.DeliveryStatus{
		models.DeliveryProcessing, models.DeliveryPacked, models.DeliveryShipped,
		models.DeliveryOutForDelivery, models.DeliveryDelivered, models.DeliveryDelivered,
	}
	paymentStatuses := []models.PaymentStatus{
		models.PaymentPaid, models.PaymentPaid, models.PaymentPaid,
		models.PaymentPending, models.PaymentFailed,
	}

	orderCount := 0
	for i := 0; i < 120; i++ {
		customerID := customerIDs[rng.Intn(len(customerIDs))]
		productID := productIDs[rng.Intn(len(productIDs))]
		product := productByID[productID]
		qty := 1 + rng.Intn(2)
		subtotal := product.Price * float64(qty)
		daysAgo := rng.Intn(60)
		createdAt := now.AddDate(0, 0, -daysAgo).Add(-time.Duration(rng.Intn(86400)) * time.Second)
		paymentStatus := paymentStatuses[rng.Intn(len(paymentStatuses))]
		deliveryStatus := deliveryStatuses[rng.Intn(len(deliveryStatuses))]
		if paymentStatus != models.PaymentPaid {
			deliveryStatus = models.DeliveryProcessing
		}

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
			ID: primitive.NewObjectID(), UserID: customerID,
			OrderNumber: fmt.Sprintf("MIZ-%06d", 100000+orderCount),
			Items: []models.OrderItem{{
				ProductID: productID.Hex(), Name: product.Name, Price: product.Price,
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
		_, _ = lib.Orders().InsertOne(ctx, order)
		orderCount++
	}

	fmt.Println("Seed complete!")
	fmt.Printf("  Admin:         %s / %s\n", adminEmail, adminPassword)
	fmt.Printf("  Categories:    %d\n", len(categories))
	fmt.Printf("  Products:      %d\n", len(products))
	fmt.Printf("  Offers:        %d\n", len(offers))
	fmt.Printf("  Customers:     %d\n", len(customerIDs))
	fmt.Printf("  Orders:        %d\n", orderCount)
	fmt.Printf("  Demo customer: %s / %s\n", demoCustomerEmail, customerPassword)
	if *skipImages {
		fmt.Println("  Images:        skipped (--skip-images)")
	} else {
		fmt.Printf("  Images:        uploaded from %s\n", resolvedImgDir)
	}
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

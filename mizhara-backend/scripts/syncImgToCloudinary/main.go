package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"mizhara-backend/lib"
	"mizhara-backend/models"
	"mizhara-backend/scripts/seed"
	"go.mongodb.org/mongo-driver/bson"
)

var skipDirs = map[string]bool{
	"_brand":  true,
	"uploads": true,
}

func main() {
	dryRun := flag.Bool("dry-run", false, "list actions without uploading or updating the database")
	imgDir := flag.String("img-dir", "", "path to img folder (default: scripts/seed/img)")
	onlyProduct := flag.String("product", "", "sync a single product folder by exact name")
	flag.Parse()

	_ = godotenv.Load()

	if err := lib.ConnectDB(); err != nil {
		fmt.Fprintln(os.Stderr, "database:", err)
		os.Exit(1)
	}

	root, err := seed.ResolveImgDir(*imgDir)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	ctx := context.Background()
	entries, err := os.ReadDir(root)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	var ok, failed int
	for _, entry := range entries {
		if !entry.IsDir() || strings.HasPrefix(entry.Name(), ".") || skipDirs[entry.Name()] {
			continue
		}
		name := entry.Name()
		if *onlyProduct != "" && name != *onlyProduct {
			continue
		}

		err := syncProduct(ctx, root, name, *dryRun)
		if err != nil {
			fmt.Fprintf(os.Stderr, "✗ %s: %v\n", name, err)
			failed++
			continue
		}
		ok++
	}

	if *onlyProduct != "" && ok == 0 && failed == 0 {
		fmt.Fprintf(os.Stderr, "no folder found for product %q under %s\n", *onlyProduct, root)
		os.Exit(1)
	}

	fmt.Printf("\nDone. synced=%d failed=%d dry-run=%v\n", ok, failed, *dryRun)
	if failed > 0 {
		os.Exit(1)
	}
}

func syncProduct(ctx context.Context, imgDir, productName string, dryRun bool) error {
	if dryRun {
		dir := filepath.Join(imgDir, productName)
		fmt.Printf("→ %s\n", productName)
		for _, f := range []string{seed.ProductImage1, seed.ProductImage2, seed.BannerDesktop, seed.BannerMobile} {
			if _, err := os.Stat(filepath.Join(dir, f)); err == nil {
				fmt.Printf("  would upload %s\n", f)
			}
		}
		fmt.Printf("  would update product %q in database\n", productName)
		return nil
	}

	var product models.Product
	if err := lib.Products().FindOne(ctx, bson.M{"name": productName}).Decode(&product); err != nil {
		return fmt.Errorf("product not found in database")
	}

	fmt.Printf("→ %s\n", productName)
	urls, err := seed.UploadProductImages(ctx, imgDir, productName)
	if err != nil {
		return err
	}

	set := bson.M{
		"images":    urls.Images,
		"updatedAt": time.Now(),
	}
	if urls.BannerImage != "" {
		set["bannerImage"] = urls.BannerImage
	}
	if urls.BannerImageMobile != "" {
		set["bannerImageMobile"] = urls.BannerImageMobile
	}

	res, err := lib.Products().UpdateOne(ctx, bson.M{"_id": product.ID}, bson.M{"$set": set})
	if err != nil {
		return fmt.Errorf("database update: %w", err)
	}
	if res.MatchedCount == 0 {
		return fmt.Errorf("database update: product not matched")
	}

	fmt.Printf("  updated database (%d image URL(s))\n", len(urls.Images))
	return nil
}

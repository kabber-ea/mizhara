package seed

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"mizhara-backend/lib"
)

const (
	ProductImage1 = "product1.webp"
	ProductImage2 = "product2.webp"
	BannerDesktop = "banner-desktop.webp"
	BannerMobile  = "banner-mobile.webp"
)

type ProductImageURLs struct {
	Images            []string
	BannerImage       string
	BannerImageMobile string
}

func DefaultImgDir() string {
	return filepath.Join("scripts", "seed", "img")
}

func ResolveImgDir(custom string) (string, error) {
	root := custom
	if root == "" {
		root = DefaultImgDir()
	}
	abs, err := filepath.Abs(root)
	if err != nil {
		return "", err
	}
	if st, err := os.Stat(abs); err != nil || !st.IsDir() {
		return "", fmt.Errorf("img folder not found: %s", abs)
	}
	return abs, nil
}

func UploadProductImages(ctx context.Context, imgDir, productName string) (ProductImageURLs, error) {
	dir := filepath.Join(imgDir, productName)
	img1 := filepath.Join(dir, ProductImage1)
	if _, err := os.Stat(img1); err != nil {
		return ProductImageURLs{}, fmt.Errorf("missing %s for %q", ProductImage1, productName)
	}

	var out ProductImageURLs
	url, err := lib.UploadImage(ctx, img1)
	if err != nil {
		return out, err
	}
	out.Images = append(out.Images, url)

	img2 := filepath.Join(dir, ProductImage2)
	if fileExists(img2) {
		url, err := lib.UploadImage(ctx, img2)
		if err != nil {
			return out, err
		}
		out.Images = append(out.Images, url)
	}

	bannerDesk := filepath.Join(dir, BannerDesktop)
	if fileExists(bannerDesk) {
		url, err := lib.UploadImage(ctx, bannerDesk)
		if err != nil {
			return out, err
		}
		out.BannerImage = url
	}

	bannerMob := filepath.Join(dir, BannerMobile)
	if fileExists(bannerMob) {
		url, err := lib.UploadImage(ctx, bannerMob)
		if err != nil {
			return out, err
		}
		out.BannerImageMobile = url
	}

	return out, nil
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

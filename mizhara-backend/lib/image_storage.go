package lib

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

func cloudinaryEnv(name string) string {
	return strings.TrimSpace(os.Getenv(name))
}

func cloudinaryConfigured() bool {
	return cloudinaryEnv("CLOUDINARY_CLOUD_NAME") != "" &&
		cloudinaryEnv("CLOUDINARY_API_KEY") != "" &&
		cloudinaryEnv("CLOUDINARY_API_SECRET") != ""
}

func UploadImage(ctx context.Context, filePath string) (string, error) {
	if !cloudinaryConfigured() {
		return "", errors.New("cloudinary is not configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET")
	}

	cld, err := cloudinary.NewFromParams(
		cloudinaryEnv("CLOUDINARY_CLOUD_NAME"),
		cloudinaryEnv("CLOUDINARY_API_KEY"),
		cloudinaryEnv("CLOUDINARY_API_SECRET"),
	)
	if err != nil {
		return "", fmt.Errorf("cloudinary init: %w", err)
	}

	file, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("open upload file: %w", err)
	}
	defer file.Close()

	// Pass *os.File, not the path string — on Windows paths like C:\... are
	// misread as URLs by the Cloudinary SDK's IsLocalFilePath check.
	result, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder:       "mizhara/products",
		ResourceType: "image",
	})
	if err != nil {
		return "", fmt.Errorf("cloudinary upload: %w", err)
	}
	if result.Error.Message != "" {
		return "", fmt.Errorf("cloudinary upload: %s", result.Error.Message)
	}

	url := strings.TrimSpace(result.SecureURL)
	if url == "" {
		url = strings.TrimSpace(result.URL)
	}
	if url == "" {
		return "", errors.New("cloudinary upload succeeded but returned no image url")
	}
	return url, nil
}

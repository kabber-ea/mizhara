package lib

import (
	"context"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

func UploadImage(ctx context.Context, filePath string) (string, error) {
	cld, err := cloudinary.NewFromParams(
		os.Getenv("CLOUDINARY_CLOUD_NAME"),
		os.Getenv("CLOUDINARY_API_KEY"),
		os.Getenv("CLOUDINARY_API_SECRET"),
	)
	if err != nil {
		return "", err
	}
	result, err := cld.Upload.Upload(ctx, filePath, uploader.UploadParams{
		Folder:       "mizhara/products",
		ResourceType: "image",
	})
	if err != nil {
		return "", err
	}
	return result.SecureURL, nil
}

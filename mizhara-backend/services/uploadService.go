package services

import (
	"context"
	"os"

	"mizhara-backend/lib"
)

func UploadProductImageForAdmin(ctx context.Context, session *lib.SessionPayload, savedPath string) (string, error) {
	if err := RequireAdmin(session); err != nil {
		return "", err
	}
	return UploadProductImage(ctx, savedPath)
}

func UploadProductImage(ctx context.Context, savedPath string) (string, error) {
	defer os.Remove(savedPath)
	return lib.UploadImage(ctx, savedPath)
}

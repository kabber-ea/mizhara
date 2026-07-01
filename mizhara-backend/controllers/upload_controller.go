package controllers

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"mizhara-backend/middleware"
	"mizhara-backend/services"
)

type UploadController struct{}

func (UploadController) Upload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file required"})
		return
	}
	ext := filepath.Ext(file.Filename)
	if ext == "" {
		ext = ".jpg"
	}
	dest := filepath.Join(os.TempDir(), uuid.New().String()+ext)
	if err := c.SaveUploadedFile(file, dest); err != nil {
		respondError(c, err)
		return
	}
	url, err := services.UploadProductImageForAdmin(c.Request.Context(), middleware.GetSession(c), dest)
	if err != nil {
		respondError(c, err)
		return
	}
	if url == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "upload returned an empty image url"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"url": url})
}

package controllers

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
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
	dest := filepath.Join(os.TempDir(), file.Filename)
	if err := c.SaveUploadedFile(file, dest); err != nil {
		respondError(c, err)
		return
	}
	url, err := services.UploadProductImageForAdmin(c.Request.Context(), middleware.GetSession(c), dest)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"url": url})
}

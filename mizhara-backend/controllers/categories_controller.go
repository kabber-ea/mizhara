package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"mizhara-backend/middleware"
	"mizhara-backend/services"
)

type CategoriesController struct{}

func (CategoriesController) List(c *gin.Context) {
	names, err := services.ListCategoryNames(c.Request.Context())
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, names)
}

func (CategoriesController) Create(c *gin.Context) {
	var body struct {
		Category string `json:"category"`
	}
	if c.BindJSON(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	if err := services.CreateCategoryForAdmin(c.Request.Context(), middleware.GetSession(c), body.Category); err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

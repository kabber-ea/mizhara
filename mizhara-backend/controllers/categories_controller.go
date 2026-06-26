package controllers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"mizhara-backend/middleware"
	"mizhara-backend/services"
)

type CategoriesController struct{}

func (CategoriesController) List(c *gin.Context) {
	items, err := services.ListCategories(c.Request.Context())
	if err != nil {
		respondError(c, err)
		return
	}
	if items == nil {
		items = []services.SerializedCategory{}
	}
	c.JSON(http.StatusOK, items)
}

func (CategoriesController) Create(c *gin.Context) {
	var body struct {
		Name     string `json:"name"`
		Category string `json:"category"`
		Image    string `json:"image"`
	}
	if c.BindJSON(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	name := strings.TrimSpace(body.Name)
	if name == "" {
		name = strings.TrimSpace(body.Category)
	}
	item, err := services.CreateCategoryForAdmin(c.Request.Context(), middleware.GetSession(c), services.CategoryInput{
		Name: name, Image: body.Image,
	})
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, item)
}

func (CategoriesController) Update(c *gin.Context) {
	var body services.CategoryInput
	if c.BindJSON(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	item, err := services.UpdateCategoryForAdmin(c.Request.Context(), middleware.GetSession(c), body)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, item)
}

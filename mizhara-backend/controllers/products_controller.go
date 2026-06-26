package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"mizhara-backend/lib"
	"mizhara-backend/middleware"
	"mizhara-backend/services"
)

type ProductsController struct{}

func (ProductsController) List(c *gin.Context) {
	items, err := services.ListProductsForViewer(c.Request.Context(), middleware.GetSession(c))
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, items)
}

func (ProductsController) Featured(c *gin.Context) {
	limit := parseLimit(c.Query("limit"), 8)
	items, err := services.GetFeaturedProducts(c.Request.Context(), limit)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, items)
}

func (ProductsController) New(c *gin.Context) {
	limit := parseLimit(c.Query("limit"), 8)
	items, err := services.GetNewProducts(c.Request.Context(), limit)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, items)
}

func (ProductsController) Trending(c *gin.Context) {
	limit := parseLimit(c.Query("limit"), 8)
	items, err := services.GetTrendingProducts(c.Request.Context(), limit)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, items)
}

func (ProductsController) GetByID(c *gin.Context) {
	item, err := services.GetProductByIDForViewer(c.Request.Context(), c.Param("id"), middleware.GetSession(c))
	if err != nil {
		respondError(c, err)
		return
	}
	if item == nil {
		respondError(c, lib.ErrNotFound)
		return
	}
	c.JSON(http.StatusOK, item)
}

func (ProductsController) Related(c *gin.Context) {
	items, err := services.GetRelatedProducts(c.Request.Context(), c.Query("category"), c.Param("id"), 4)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, items)
}

func (ProductsController) Create(c *gin.Context) {
	var input services.ProductInput
	if c.BindJSON(&input) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	item, err := services.CreateProductForAdmin(c.Request.Context(), middleware.GetSession(c), input)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, item)
}

func (ProductsController) Update(c *gin.Context) {
	var input services.ProductInput
	if c.BindJSON(&input) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	item, err := services.UpdateProductForAdmin(c.Request.Context(), middleware.GetSession(c), input)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, item)
}

func (ProductsController) Delete(c *gin.Context) {
	item, err := services.DeleteProductForAdmin(c.Request.Context(), middleware.GetSession(c), c.Query("id"))
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, item)
}

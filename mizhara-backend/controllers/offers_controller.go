package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"mizhara-backend/middleware"
	"mizhara-backend/services"
)

type OffersController struct{}

func (OffersController) ListActive(c *gin.Context) {
	items, err := services.ListActiveOffers(c.Request.Context())
	if err != nil {
		respondError(c, err)
		return
	}
	if items == nil {
		items = []services.SerializedOffer{}
	}
	c.JSON(http.StatusOK, items)
}

func (OffersController) Preview(c *gin.Context) {
	var input services.OfferPreviewInput
	if c.BindJSON(&input) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	result, err := services.PreviewOffer(c.Request.Context(), input)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, result)
}

func (OffersController) List(c *gin.Context) {
	session := middleware.GetSession(c)
	if c.Query("page") != "" {
		result, err := services.ListOffersForAdminPaginated(
			c.Request.Context(), session,
			c.Query("page"), c.Query("limit"), c.Query("search"),
		)
		if err != nil {
			respondError(c, err)
			return
		}
		c.JSON(http.StatusOK, result)
		return
	}
	items, err := services.ListOffersForAdmin(c.Request.Context(), session)
	if err != nil {
		respondError(c, err)
		return
	}
	if items == nil {
		items = []services.SerializedOffer{}
	}
	c.JSON(http.StatusOK, items)
}

func (OffersController) Create(c *gin.Context) {
	var input services.OfferInput
	if c.BindJSON(&input) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	item, err := services.CreateOfferForAdmin(c.Request.Context(), middleware.GetSession(c), input)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, item)
}

func (OffersController) Update(c *gin.Context) {
	var input services.OfferInput
	if c.BindJSON(&input) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	item, err := services.UpdateOfferForAdmin(c.Request.Context(), middleware.GetSession(c), input)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, item)
}

func (OffersController) Delete(c *gin.Context) {
	if err := services.DeleteOfferForAdmin(c.Request.Context(), middleware.GetSession(c), c.Query("id")); err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

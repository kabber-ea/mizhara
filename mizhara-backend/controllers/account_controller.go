package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"mizhara-backend/middleware"
	"mizhara-backend/services"
)

type AccountController struct{}

func (AccountController) GetProfile(c *gin.Context) {
	profile, err := services.GetCustomerProfileForSession(c.Request.Context(), middleware.GetSession(c))
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, profile)
}

func (AccountController) UpdateProfile(c *gin.Context) {
	var body services.ProfileUpdate
	if c.BindJSON(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	result, err := services.UpdateCustomerProfileForSession(c.Request.Context(), middleware.GetSession(c), body)
	if err != nil {
		respondError(c, err)
		return
	}
	if result.Token != "" {
		middleware.SetSessionCookie(c, result.Token)
	}
	c.JSON(http.StatusOK, result.Profile)
}

func (AccountController) ListOrders(c *gin.Context) {
	items, err := services.ListCustomerOrdersForSession(c.Request.Context(), middleware.GetSession(c))
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": items})
}

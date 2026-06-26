package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"mizhara-backend/middleware"
	"mizhara-backend/services"
)

type PaymentController struct{}

func (PaymentController) Create(c *gin.Context) {
	var input services.PaymentCreateInput
	if c.BindJSON(&input) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	result, err := services.CreatePaymentForSession(c.Request.Context(), middleware.GetSession(c), input)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, result)
}

func (PaymentController) Verify(c *gin.Context) {
	var body services.PaymentVerifyInput
	if c.BindJSON(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	result, err := services.VerifyPaymentForSession(c.Request.Context(), middleware.GetSession(c), body)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, result)
}

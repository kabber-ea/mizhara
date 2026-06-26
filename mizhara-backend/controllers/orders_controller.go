package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"mizhara-backend/middleware"
	"mizhara-backend/services"
)

type OrdersController struct{}

func (OrdersController) List(c *gin.Context) {
	result, err := services.ListOrdersForAdmin(
		c.Request.Context(), middleware.GetSession(c),
		c.Query("page"), c.Query("limit"), c.Query("search"),
		c.Query("deliveryStatus"), c.Query("paymentStatus"),
	)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, result)
}

func (OrdersController) GetByID(c *gin.Context) {
	order, err := services.GetOrderByIDForAdmin(c.Request.Context(), middleware.GetSession(c), c.Param("id"))
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, order)
}

func (OrdersController) Update(c *gin.Context) {
	var body services.FulfillmentUpdate
	if c.BindJSON(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	order, err := services.UpdateOrderFulfillmentForAdmin(c.Request.Context(), middleware.GetSession(c), c.Param("id"), body)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, order)
}

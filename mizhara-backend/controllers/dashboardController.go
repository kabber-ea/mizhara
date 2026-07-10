package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"mizhara-backend/middleware"
	"mizhara-backend/services"
)

type DashboardController struct{}

func (DashboardController) Get(c *gin.Context) {
	data, err := services.GetDashboardDataForAdmin(c.Request.Context(), middleware.GetSession(c))
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, data)
}

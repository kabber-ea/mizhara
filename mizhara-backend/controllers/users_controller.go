package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"mizhara-backend/middleware"
	"mizhara-backend/services"
)

type UsersController struct{}

func (UsersController) ListCustomers(c *gin.Context) {
	result, err := services.ListUsersForAdmin(
		c.Request.Context(), middleware.GetSession(c),
		c.Query("page"), c.Query("limit"), c.Query("search"),
	)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, result)
}

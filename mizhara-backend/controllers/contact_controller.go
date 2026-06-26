package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"mizhara-backend/services"
)

type ContactController struct{}

func (ContactController) Submit(c *gin.Context) {
	var input services.ContactInput
	if c.BindJSON(&input) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	resp, err := services.SubmitContact(c.Request.Context(), input)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, resp)
}

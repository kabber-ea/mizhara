package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"mizhara-backend/lib"
	"mizhara-backend/middleware"
	"mizhara-backend/services"
)

type AuthController struct{}

func (AuthController) Login(c *gin.Context) {
	var body struct {
		Identifier string `json:"identifier"`
		Email      string `json:"email"`
		Password   string `json:"password"`
	}
	if c.BindJSON(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	result, err := services.Login(c.Request.Context(), body.Identifier, body.Email, body.Password)
	if err != nil {
		respondError(c, err)
		return
	}
	middleware.SetSessionCookie(c, result.Token)
	c.JSON(http.StatusOK, gin.H{"user": result.User})
}

func (AuthController) Register(c *gin.Context) {
	var body struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Phone    string `json:"phone"`
		Password string `json:"password"`
	}
	if c.BindJSON(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	if err := services.RegisterUser(c.Request.Context(), body.Name, body.Email, body.Phone, body.Password); err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (AuthController) Logout(c *gin.Context) {
	middleware.ClearSessionCookie(c)
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func (AuthController) Me(c *gin.Context) {
	token, _ := c.Cookie(lib.CookieName)
	user, err := services.GetUserByToken(token)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"user": user})
}

func (AuthController) ForgotPassword(c *gin.Context) {
	var body struct {
		Email string `json:"email"`
	}
	if c.BindJSON(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	resp, err := services.RequestPasswordReset(c.Request.Context(), body.Email)
	if err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, resp)
}

func (AuthController) ResetPassword(c *gin.Context) {
	var body struct {
		Token    string `json:"token"`
		Password string `json:"password"`
	}
	if c.BindJSON(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}
	if err := services.ResetPassword(c.Request.Context(), body.Token, body.Password); err != nil {
		respondError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Password reset successful. You can sign in now."})
}

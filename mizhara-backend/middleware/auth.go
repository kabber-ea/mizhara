package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"mizhara-backend/lib"
)

func loadSession(c *gin.Context) *lib.SessionPayload {
	token, err := c.Cookie(lib.CookieName)
	if err != nil || token == "" {
		return nil
	}
	session, err := lib.VerifyToken(token)
	if err != nil {
		return nil
	}
	c.Set("session", session)
	return session
}

// OptionalAuth attaches session when a valid cookie is present.
func OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		loadSession(c)
		c.Next()
	}
}

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		if loadSession(c) == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		c.Next()
	}
}

func GetSession(c *gin.Context) *lib.SessionPayload {
	val, ok := c.Get("session")
	if !ok || val == nil {
		return nil
	}
	return val.(*lib.SessionPayload)
}

func SetSessionCookie(c *gin.Context, token string) {
	secure := gin.Mode() == gin.ReleaseMode
	if secure {
		c.SetSameSite(http.SameSiteNoneMode)
	} else {
		c.SetSameSite(http.SameSiteLaxMode)
	}
	c.SetCookie(lib.CookieName, token, 7*24*60*60, "/", "", secure, true)
}

func ClearSessionCookie(c *gin.Context) {
	secure := gin.Mode() == gin.ReleaseMode
	if secure {
		c.SetSameSite(http.SameSiteNoneMode)
	}
	c.SetCookie(lib.CookieName, "", -1, "/", "", secure, true)
}

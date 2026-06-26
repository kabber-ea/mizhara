package controllers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"mizhara-backend/lib"
)

func respondError(c *gin.Context, err error) {
	if err == nil {
		return
	}
	status := http.StatusInternalServerError
	switch {
	case errors.Is(err, lib.ErrUnauthorized), errors.Is(err, lib.ErrInvalidCredentials):
		status = http.StatusUnauthorized
	case errors.Is(err, lib.ErrForbidden):
		status = http.StatusForbidden
	case errors.Is(err, lib.ErrNotFound):
		status = http.StatusNotFound
	case errors.Is(err, lib.ErrBadRequest):
		status = http.StatusBadRequest
	}
	msg := err.Error()
	if errors.Is(err, lib.ErrBadRequest) || errors.Is(err, lib.ErrForbidden) {
		if parts := strings.SplitN(msg, ": ", 2); len(parts) == 2 {
			msg = parts[1]
		}
	}
	c.JSON(status, gin.H{"error": msg})
}

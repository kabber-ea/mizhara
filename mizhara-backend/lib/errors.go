package lib

import (
	"errors"
	"fmt"
)

var (
	ErrUnauthorized          = errors.New("unauthorized")
	ErrForbidden             = errors.New("forbidden")
	ErrBadRequest            = errors.New("bad request")
	ErrRazorpayNotConfigured = errors.New("razorpay keys are not configured")
	ErrInvalidCredentials    = errors.New("invalid credentials")
	ErrNotFound              = errors.New("not found")
)

func BadRequest(msg string) error {
	return fmt.Errorf("%w: %s", ErrBadRequest, msg)
}

package lib

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const CookieName = "mizhara_session"

type UserRole string

const (
	RoleAdmin    UserRole = "admin"
	RoleCustomer UserRole = "customer"
)

type SessionPayload struct {
	UserID string   `json:"userId"`
	Role   UserRole `json:"role"`
	Name   string   `json:"name"`
	Email  string   `json:"email,omitempty"`
	Phone  string   `json:"phone,omitempty"`
	jwt.RegisteredClaims
}

func jwtSecret() ([]byte, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return nil, errors.New("JWT_SECRET is not set")
	}
	return []byte(secret), nil
}

func SignToken(payload SessionPayload) (string, error) {
	secret, err := jwtSecret()
	if err != nil {
		return "", err
	}
	payload.RegisteredClaims = jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, payload)
	return token.SignedString(secret)
}

func VerifyToken(tokenStr string) (*SessionPayload, error) {
	secret, err := jwtSecret()
	if err != nil {
		return nil, err
	}
	token, err := jwt.ParseWithClaims(tokenStr, &SessionPayload{}, func(t *jwt.Token) (interface{}, error) {
		return secret, nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*SessionPayload)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}

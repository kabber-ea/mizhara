package services

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"os"
	"regexp"
	"strings"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"
	"mizhara-backend/store"
	"mizhara-backend/utils"
	"golang.org/x/crypto/bcrypt"
)

type UserDTO struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email,omitempty"`
	Phone string `json:"phone,omitempty"`
	Role  string `json:"role"`
}

type LoginResult struct {
	Token string
	User  UserDTO
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func sessionToUserDTO(session lib.SessionPayload) UserDTO {
	return UserDTO{
		ID: session.UserID, Name: session.Name, Email: session.Email,
		Phone: session.Phone, Role: string(session.Role),
	}
}

func Login(ctx context.Context, identifier, email, password string) (*LoginResult, error) {
	id := strings.TrimSpace(identifier)
	if id == "" {
		id = strings.TrimSpace(email)
	}
	if id == "" || password == "" {
		return nil, utils.BadRequest("identifier and password are required")
	}
	session, err := Authenticate(ctx, id, password)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, utils.ErrInvalidCredentials
	}
	token, err := lib.SignToken(*session)
	if err != nil {
		return nil, err
	}
	return &LoginResult{Token: token, User: sessionToUserDTO(*session)}, nil
}

func GetUserByToken(token string) (*UserDTO, error) {
	if token == "" {
		return nil, nil
	}
	session, err := lib.VerifyToken(token)
	if err != nil {
		return nil, nil
	}
	user := sessionToUserDTO(*session)
	return &user, nil
}

func Authenticate(ctx context.Context, identifier, password string) (*lib.SessionPayload, error) {
	trimmed := strings.TrimSpace(identifier)
	var user *models.User
	var err error
	if strings.Contains(trimmed, "@") {
		user, err = store.FindUserByEmail(ctx, strings.ToLower(trimmed))
	} else {
		re := regexp.MustCompile(`\D`)
		user, err = store.FindUserByPhone(ctx, re.ReplaceAllString(trimmed, ""))
	}
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, nil
	}
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) != nil {
		return nil, nil
	}
	return &lib.SessionPayload{
		UserID: user.ID,
		Role:   lib.UserRole(user.Role),
		Name:   user.Name,
		Email:  user.Email,
		Phone:  user.Phone,
	}, nil
}

func RegisterUser(ctx context.Context, name, email, phone, password string) error {
	if strings.TrimSpace(name) == "" || password == "" {
		return utils.BadRequest("name and password are required")
	}
	if len(password) < 6 {
		return utils.BadRequest("password must be at least 6 characters")
	}
	now := time.Now()
	normalizedEmail := strings.ToLower(strings.TrimSpace(email))
	normalizedPhone := regexp.MustCompile(`\D`).ReplaceAllString(phone, "")

	if normalizedEmail != "" {
		count, _ := store.CountUsersByEmail(ctx, normalizedEmail)
		if count > 0 {
			return utils.BadRequest("email already registered")
		}
	}
	if normalizedPhone != "" {
		count, _ := store.CountUsersByPhone(ctx, normalizedPhone)
		if count > 0 {
			return utils.BadRequest("mobile number already registered")
		}
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return err
	}

	user := models.User{
		ID: lib.NewID(), Name: strings.TrimSpace(name),
		Email: normalizedEmail, Phone: normalizedPhone,
		Password: string(hashed), Role: models.RoleCustomer,
		CreatedAt: now, UpdatedAt: now,
	}
	return store.InsertUser(ctx, &user)
}

func RequestPasswordReset(ctx context.Context, email string) (map[string]string, error) {
	if strings.TrimSpace(email) == "" {
		return nil, utils.BadRequest("email is required")
	}
	generic := "If an account exists with this email, you will receive a password reset link shortly."
	user, err := store.FindUserByEmail(ctx, strings.ToLower(strings.TrimSpace(email)))
	if err != nil {
		return nil, err
	}
	if user == nil {
		return map[string]string{"message": generic}, nil
	}

	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return nil, err
	}
	rawToken := hex.EncodeToString(raw)
	expires := time.Now().Add(time.Hour)
	if err := store.UpdateUserPasswordReset(ctx, user.ID, hashToken(rawToken), expires); err != nil {
		return nil, err
	}

	resetURL := lib.GetAppURL() + "/reset-password?token=" + rawToken
	html := "<p>Hi " + user.Name + ",</p><p>We received a request to reset your Mizhara password.</p>" +
		"<p><a href=\"" + resetURL + "\">Click here to reset your password</a></p>" +
		"<p>This link expires in 1 hour.</p>"

	result, _ := lib.SendEmail(user.Email, "Reset your Mizhara password", html)
	resp := map[string]string{"message": generic}
	if !result.Sent && (os.Getenv("NODE_ENV") == "development" || os.Getenv("GO_ENV") == "development") {
		resp["devResetUrl"] = resetURL
	}
	return resp, nil
}

func ResetPassword(ctx context.Context, token, password string) error {
	if strings.TrimSpace(token) == "" || password == "" {
		return utils.BadRequest("token and new password are required")
	}
	if len(password) < 6 {
		return utils.BadRequest("password must be at least 6 characters")
	}
	user, err := store.FindUserByResetToken(ctx, hashToken(token))
	if err != nil {
		return err
	}
	if user == nil {
		return utils.BadRequest("invalid or expired reset link")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return err
	}
	return store.ClearUserPasswordReset(ctx, user.ID, string(hashed))
}

package services

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"os"
	"regexp"
	"strings"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
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
		return nil, lib.BadRequest("identifier and password are required")
	}
	session, err := Authenticate(ctx, id, password)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, lib.ErrInvalidCredentials
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
	filter := bson.M{}
	if strings.Contains(trimmed, "@") {
		filter["email"] = strings.ToLower(trimmed)
	} else {
		re := regexp.MustCompile(`\D`)
		filter["phone"] = re.ReplaceAllString(trimmed, "")
	}

	var user models.User
	err := lib.Users().FindOne(ctx, filter).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) != nil {
		return nil, nil
	}
	return &lib.SessionPayload{
		UserID: user.ID.Hex(),
		Role:   lib.UserRole(user.Role),
		Name:   user.Name,
		Email:  user.Email,
		Phone:  user.Phone,
	}, nil
}

func RegisterUser(ctx context.Context, name, email, phone, password string) error {
	if strings.TrimSpace(name) == "" || password == "" {
		return lib.BadRequest("name and password are required")
	}
	if len(password) < 6 {
		return lib.BadRequest("password must be at least 6 characters")
	}
	now := time.Now()
	normalizedEmail := strings.ToLower(strings.TrimSpace(email))
	normalizedPhone := regexp.MustCompile(`\D`).ReplaceAllString(phone, "")

	if normalizedEmail != "" {
		count, _ := lib.Users().CountDocuments(ctx, bson.M{"email": normalizedEmail})
		if count > 0 {
			return lib.BadRequest("email already registered")
		}
	}
	if normalizedPhone != "" {
		count, _ := lib.Users().CountDocuments(ctx, bson.M{"phone": normalizedPhone})
		if count > 0 {
			return lib.BadRequest("mobile number already registered")
		}
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return err
	}

	user := models.User{
		ID:        primitive.NewObjectID(),
		Name:      strings.TrimSpace(name),
		Email:     normalizedEmail,
		Phone:     normalizedPhone,
		Password:  string(hashed),
		Role:      models.RoleCustomer,
		CreatedAt: now,
		UpdatedAt: now,
	}
	_, err = lib.Users().InsertOne(ctx, user)
	return err
}

func RequestPasswordReset(ctx context.Context, email string) (map[string]string, error) {
	if strings.TrimSpace(email) == "" {
		return nil, lib.BadRequest("email is required")
	}
	generic := "If an account exists with this email, you will receive a password reset link shortly."
	var user models.User
	err := lib.Users().FindOne(ctx, bson.M{"email": strings.ToLower(strings.TrimSpace(email))}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return map[string]string{"message": generic}, nil
		}
		return nil, err
	}

	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return nil, err
	}
	rawToken := hex.EncodeToString(raw)
	expires := time.Now().Add(time.Hour)
	_, err = lib.Users().UpdateOne(ctx, bson.M{"_id": user.ID}, bson.M{
		"$set": bson.M{
			"resetPasswordToken":   hashToken(rawToken),
			"resetPasswordExpires": expires,
			"updatedAt":            time.Now(),
		},
	})
	if err != nil {
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
		return lib.BadRequest("token and new password are required")
	}
	if len(password) < 6 {
		return lib.BadRequest("password must be at least 6 characters")
	}
	var user models.User
	err := lib.Users().FindOne(ctx, bson.M{
		"resetPasswordToken":   hashToken(token),
		"resetPasswordExpires": bson.M{"$gt": time.Now()},
	}).Decode(&user)
	if err != nil {
		return lib.BadRequest("invalid or expired reset link")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return err
	}

	_, err = lib.Users().UpdateOne(ctx, bson.M{"_id": user.ID}, bson.M{
		"$set": bson.M{
			"password":  string(hashed),
			"updatedAt": time.Now(),
		},
		"$unset": bson.M{
			"resetPasswordToken":   "",
			"resetPasswordExpires": "",
		},
	})
	return err
}

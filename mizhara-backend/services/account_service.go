package services

import (
	"context"
	"errors"
	"regexp"
	"strings"
	"time"

	"mizhara-backend/lib"
	"mizhara-backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type SavedAddress struct {
	Address string `json:"address,omitempty"`
	City    string `json:"city,omitempty"`
	State   string `json:"state,omitempty"`
	Pincode string `json:"pincode,omitempty"`
}

type CustomerProfile struct {
	ID           string        `json:"id"`
	Name         string        `json:"name"`
	Email        string        `json:"email,omitempty"`
	Phone        string        `json:"phone,omitempty"`
	SavedAddress *SavedAddress `json:"savedAddress,omitempty"`
}

type CustomerOrder struct {
	ID               string             `json:"id"`
	OrderNumber      string             `json:"orderNumber"`
	Items            []models.OrderItem `json:"items"`
	ItemCount        int                `json:"itemCount"`
	Total            float64            `json:"total"`
	PaymentStatus    string             `json:"paymentStatus"`
	DeliveryStatus   string             `json:"deliveryStatus"`
	TrackingURL      string             `json:"trackingUrl,omitempty"`
	TrackingNumber   string             `json:"trackingNumber,omitempty"`
	TrackingProvider string             `json:"trackingProvider,omitempty"`
	CreatedAt        string             `json:"createdAt"`
}

type ProfileUpdate struct {
	Name         string        `json:"name"`
	Phone        string        `json:"phone"`
	SavedAddress *SavedAddress `json:"savedAddress"`
}

type ProfileUpdateResult struct {
	Profile *CustomerProfile
	Token   string
}

func GetCustomerProfileForSession(ctx context.Context, session *lib.SessionPayload) (*CustomerProfile, error) {
	if err := RequireCustomer(session); err != nil {
		return nil, err
	}
	profile, err := GetCustomerProfile(ctx, session.UserID)
	if err != nil {
		return nil, err
	}
	if profile == nil {
		return nil, lib.ErrNotFound
	}
	return profile, nil
}

func UpdateCustomerProfileForSession(ctx context.Context, session *lib.SessionPayload, data ProfileUpdate) (*ProfileUpdateResult, error) {
	if err := RequireCustomer(session); err != nil {
		return nil, err
	}
	updated, err := UpdateCustomerProfile(ctx, session.UserID, data)
	if err != nil {
		return nil, err
	}
	result := &ProfileUpdateResult{}
	if updated != nil {
		token, err := lib.SignToken(*updated)
		if err != nil {
			return nil, err
		}
		result.Token = token
	}
	profile, err := GetCustomerProfile(ctx, session.UserID)
	if err != nil {
		return nil, err
	}
	result.Profile = profile
	return result, nil
}

func ListCustomerOrdersForSession(ctx context.Context, session *lib.SessionPayload) ([]CustomerOrder, error) {
	if err := RequireCustomer(session); err != nil {
		return nil, err
	}
	return ListCustomerOrders(ctx, session.UserID)
}

func GetCustomerProfile(ctx context.Context, userID string) (*CustomerProfile, error) {
	oid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}
	var user models.User
	err = lib.Users().FindOne(ctx, bson.M{"_id": oid, "role": models.RoleCustomer}).Decode(&user)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	profile := &CustomerProfile{ID: user.ID.Hex(), Name: user.Name, Email: user.Email, Phone: user.Phone}
	if user.SavedAddress != nil {
		profile.SavedAddress = &SavedAddress{
			Address: user.SavedAddress.Address, City: user.SavedAddress.City,
			State: user.SavedAddress.State, Pincode: user.SavedAddress.Pincode,
		}
	}
	return profile, nil
}

func UpdateCustomerProfile(ctx context.Context, userID string, data ProfileUpdate) (*lib.SessionPayload, error) {
	oid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}
	var user models.User
	err = lib.Users().FindOne(ctx, bson.M{"_id": oid}).Decode(&user)
	if errors.Is(err, mongo.ErrNoDocuments) || user.Role != models.RoleCustomer {
		return nil, nil
	}
	if strings.TrimSpace(data.Name) != "" {
		user.Name = strings.TrimSpace(data.Name)
	}
	if data.Phone != "" {
		normalized := regexp.MustCompile(`\D`).ReplaceAllString(data.Phone, "")
		if normalized != "" {
			count, _ := lib.Users().CountDocuments(ctx, bson.M{"phone": normalized, "_id": bson.M{"$ne": oid}})
			if count > 0 {
				return nil, lib.BadRequest("mobile number already in use")
			}
			user.Phone = normalized
		}
	}
	if data.SavedAddress != nil {
		user.SavedAddress = &models.SavedAddress{
			Address: strings.TrimSpace(data.SavedAddress.Address),
			City:    strings.TrimSpace(data.SavedAddress.City),
			State:   strings.TrimSpace(data.SavedAddress.State),
			Pincode: strings.TrimSpace(data.SavedAddress.Pincode),
		}
	}
	user.UpdatedAt = time.Now()
	_, err = lib.Users().ReplaceOne(ctx, bson.M{"_id": oid}, user)
	if err != nil {
		return nil, err
	}
	return &lib.SessionPayload{
		UserID: user.ID.Hex(), Role: lib.RoleCustomer, Name: user.Name,
		Email: user.Email, Phone: user.Phone,
	}, nil
}

func ListCustomerOrders(ctx context.Context, userID string) ([]CustomerOrder, error) {
	oid, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}
	cur, err := lib.Orders().Find(ctx, bson.M{"userId": oid})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)
	var out []CustomerOrder
	for cur.Next(ctx) {
		var o models.Order
		_ = cur.Decode(&o)
		count := 0
		for _, it := range o.Items {
			count += it.Quantity
		}
		out = append(out, CustomerOrder{
			ID: o.ID.Hex(), OrderNumber: o.OrderNumber, Items: o.Items, ItemCount: count,
			Total: o.Total, PaymentStatus: string(o.PaymentStatus), DeliveryStatus: string(o.DeliveryStatus),
			TrackingURL: o.TrackingURL, TrackingNumber: o.TrackingNumber,
			TrackingProvider: string(o.TrackingProvider),
			CreatedAt: o.CreatedAt.Format(time.RFC3339),
		})
	}
	return out, nil
}

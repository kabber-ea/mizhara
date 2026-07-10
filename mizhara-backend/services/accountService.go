package services

import (
	"context"
	"regexp"
	"strings"
	"time"

	"mizhara-backend/constants"
	"mizhara-backend/lib"
	"mizhara-backend/models"
	"mizhara-backend/store"
	"mizhara-backend/utils"
)

type SavedAddress struct {
	ID        string `json:"id,omitempty"`
	Label     string `json:"label,omitempty"`
	Address   string `json:"address,omitempty"`
	City      string `json:"city,omitempty"`
	State     string `json:"state,omitempty"`
	Pincode   string `json:"pincode,omitempty"`
	IsDefault bool   `json:"isDefault,omitempty"`
}

type CustomerProfile struct {
	ID             string         `json:"id"`
	Name           string         `json:"name"`
	Email          string         `json:"email,omitempty"`
	Phone          string         `json:"phone,omitempty"`
	SavedAddress   *SavedAddress  `json:"savedAddress,omitempty"`
	SavedAddresses []SavedAddress `json:"savedAddresses,omitempty"`
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
	Name           string          `json:"name"`
	Phone          string          `json:"phone"`
	SavedAddress   *SavedAddress   `json:"savedAddress"`
	SavedAddresses *[]SavedAddress `json:"savedAddresses"`
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
		return nil, utils.ErrNotFound
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
	if !lib.ValidID(userID) {
		return nil, nil
	}
	user, err := store.FindUserByID(ctx, userID)
	if err != nil || user == nil || user.Role != models.RoleCustomer {
		return nil, err
	}
	profile := &CustomerProfile{ID: user.ID, Name: user.Name, Email: user.Email, Phone: user.Phone}
	addrs := normalizeSavedAddresses(*user)
	profile.SavedAddresses = toAPISavedAddresses(addrs)
	if defaultAddr := defaultSavedAddress(addrs); defaultAddr != nil {
		profile.SavedAddress = toAPISavedAddress(*defaultAddr)
	}
	return profile, nil
}

func normalizeSavedAddresses(user models.User) []models.SavedAddress {
	if len(user.SavedAddresses) > 0 {
		return user.SavedAddresses
	}
	if user.SavedAddress == nil {
		return nil
	}
	legacy := user.SavedAddress
	if strings.TrimSpace(legacy.Address) == "" && strings.TrimSpace(legacy.City) == "" &&
		strings.TrimSpace(legacy.State) == "" && strings.TrimSpace(legacy.Pincode) == "" {
		return nil
	}
	id := strings.TrimSpace(legacy.ID)
	if id == "" {
		id = lib.NewID()
	}
	return []models.SavedAddress{{
		ID: id, Label: legacy.Label, Address: legacy.Address, City: legacy.City,
		State: legacy.State, Pincode: legacy.Pincode, IsDefault: true,
	}}
}

func defaultSavedAddress(addrs []models.SavedAddress) *models.SavedAddress {
	for i := range addrs {
		if addrs[i].IsDefault {
			return &addrs[i]
		}
	}
	if len(addrs) > 0 {
		return &addrs[0]
	}
	return nil
}

func toAPISavedAddress(addr models.SavedAddress) *SavedAddress {
	return &SavedAddress{
		ID: addr.ID, Label: addr.Label, Address: addr.Address, City: addr.City,
		State: addr.State, Pincode: addr.Pincode, IsDefault: addr.IsDefault,
	}
}

func toAPISavedAddresses(addrs []models.SavedAddress) []SavedAddress {
	out := make([]SavedAddress, 0, len(addrs))
	for _, addr := range addrs {
		out = append(out, *toAPISavedAddress(addr))
	}
	return out
}

func normalizeSavedAddressInput(addrs []SavedAddress) ([]models.SavedAddress, error) {
	if len(addrs) > constants.MaxSavedAddresses {
		return nil, utils.BadRequest("you can save up to 5 addresses")
	}
	out := make([]models.SavedAddress, 0, len(addrs))
	defaultCount := 0
	for _, item := range addrs {
		addr := strings.TrimSpace(item.Address)
		city := strings.TrimSpace(item.City)
		state := strings.TrimSpace(item.State)
		pincode := strings.TrimSpace(item.Pincode)
		if addr == "" || city == "" || state == "" || pincode == "" {
			return nil, utils.BadRequest("each saved address needs street, city, state, and pincode")
		}
		id := strings.TrimSpace(item.ID)
		if id == "" {
			id = lib.NewID()
		}
		if item.IsDefault {
			defaultCount++
		}
		out = append(out, models.SavedAddress{
			ID: id, Label: strings.TrimSpace(item.Label), Address: addr, City: city,
			State: state, Pincode: pincode, IsDefault: item.IsDefault,
		})
	}
	if len(out) > 0 && defaultCount == 0 {
		out[0].IsDefault = true
	}
	if defaultCount > 1 {
		seen := false
		for i := range out {
			if out[i].IsDefault {
				if seen {
					out[i].IsDefault = false
				}
				seen = true
			}
		}
	}
	return out, nil
}

func UpdateCustomerProfile(ctx context.Context, userID string, data ProfileUpdate) (*lib.SessionPayload, error) {
	if !lib.ValidID(userID) {
		return nil, nil
	}
	user, err := store.FindUserByID(ctx, userID)
	if err != nil || user == nil || user.Role != models.RoleCustomer {
		return nil, err
	}
	if strings.TrimSpace(data.Name) != "" {
		user.Name = strings.TrimSpace(data.Name)
	}
	if data.Phone != "" {
		normalized := regexpDigitsOnly(data.Phone)
		if normalized != "" {
			count, _ := store.CountUsersByPhoneExcluding(ctx, normalized, userID)
			if count > 0 {
				return nil, utils.BadRequest("mobile number already in use")
			}
			user.Phone = normalized
		}
	}
	if data.SavedAddresses != nil {
		normalized, err := normalizeSavedAddressInput(*data.SavedAddresses)
		if err != nil {
			return nil, err
		}
		user.SavedAddresses = normalized
		user.SavedAddress = nil
	} else if data.SavedAddress != nil {
		normalized, err := normalizeSavedAddressInput([]SavedAddress{*data.SavedAddress})
		if err != nil {
			return nil, err
		}
		user.SavedAddresses = normalized
		user.SavedAddress = nil
	}
	user.UpdatedAt = time.Now()
	if err := store.ReplaceUser(ctx, user); err != nil {
		return nil, err
	}
	return &lib.SessionPayload{
		UserID: user.ID, Role: lib.RoleCustomer, Name: user.Name,
		Email: user.Email, Phone: user.Phone,
	}, nil
}

func regexpDigitsOnly(phone string) string {
	re := regexp.MustCompile(`\D`)
	return re.ReplaceAllString(phone, "")
}

func ListCustomerOrders(ctx context.Context, userID string) ([]CustomerOrder, error) {
	if !lib.ValidID(userID) {
		return nil, nil
	}
	orders, err := store.ListOrdersByUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	out := make([]CustomerOrder, 0, len(orders))
	for _, o := range orders {
		out = append(out, CustomerOrder{
			ID: o.ID, OrderNumber: o.OrderNumber, Items: o.Items, ItemCount: sumOrderItemQuantities(o.Items),
			Total: o.Total, PaymentStatus: string(o.PaymentStatus), DeliveryStatus: string(o.DeliveryStatus),
			TrackingURL: o.TrackingURL, TrackingNumber: o.TrackingNumber,
			TrackingProvider: string(o.TrackingProvider),
			CreatedAt: o.CreatedAt.Format(time.RFC3339),
		})
	}
	return out, nil
}

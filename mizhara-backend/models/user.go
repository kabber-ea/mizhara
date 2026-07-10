package models

import "time"

type UserRole string

const (
	RoleAdmin    UserRole = "admin"
	RoleCustomer UserRole = "customer"
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

type User struct {
	ID                   string         `json:"id"`
	Name                 string         `json:"name"`
	Email                string         `json:"email,omitempty"`
	Phone                string         `json:"phone,omitempty"`
	Password             string         `json:"-"`
	Role                 UserRole       `json:"role"`
	SavedAddress         *SavedAddress  `json:"-"`
	SavedAddresses       []SavedAddress `json:"savedAddresses,omitempty"`
	ResetPasswordToken   string         `json:"-"`
	ResetPasswordExpires *time.Time     `json:"-"`
	CreatedAt            time.Time      `json:"createdAt"`
	UpdatedAt            time.Time      `json:"updatedAt"`
}

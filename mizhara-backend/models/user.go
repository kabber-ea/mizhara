package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserRole string

const (
	RoleAdmin    UserRole = "admin"
	RoleCustomer UserRole = "customer"
)

type SavedAddress struct {
	ID        string `bson:"id,omitempty" json:"id,omitempty"`
	Label     string `bson:"label,omitempty" json:"label,omitempty"`
	Address   string `bson:"address,omitempty" json:"address,omitempty"`
	City      string `bson:"city,omitempty" json:"city,omitempty"`
	State     string `bson:"state,omitempty" json:"state,omitempty"`
	Pincode   string `bson:"pincode,omitempty" json:"pincode,omitempty"`
	IsDefault bool   `bson:"isDefault,omitempty" json:"isDefault,omitempty"`
}

type User struct {
	ID                   primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name                 string             `bson:"name" json:"name"`
	Email                string             `bson:"email,omitempty" json:"email,omitempty"`
	Phone                string             `bson:"phone,omitempty" json:"phone,omitempty"`
	Password             string             `bson:"password" json:"-"`
	Role                 UserRole           `bson:"role" json:"role"`
	SavedAddress         *SavedAddress      `bson:"savedAddress,omitempty" json:"-"`
	SavedAddresses       []SavedAddress     `bson:"savedAddresses,omitempty" json:"savedAddresses,omitempty"`
	ResetPasswordToken   string             `bson:"resetPasswordToken,omitempty" json:"-"`
	ResetPasswordExpires *time.Time         `bson:"resetPasswordExpires,omitempty" json:"-"`
	CreatedAt            time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt            time.Time          `bson:"updatedAt" json:"updatedAt"`
}

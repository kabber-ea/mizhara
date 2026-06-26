package lib

import (
	"os"

	"github.com/razorpay/razorpay-go"
)

func NewRazorpayClient() (*razorpay.Client, error) {
	keyID := os.Getenv("RAZORPAY_KEY_ID")
	keySecret := os.Getenv("RAZORPAY_KEY_SECRET")
	if keyID == "" || keySecret == "" {
		return nil, ErrRazorpayNotConfigured
	}
	return razorpay.NewClient(keyID, keySecret), nil
}

func RazorpayPublicKey() string {
	if k := os.Getenv("VITE_RAZORPAY_KEY_ID"); k != "" {
		return k
	}
	return os.Getenv("RAZORPAY_KEY_ID")
}

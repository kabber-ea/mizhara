package lib

import (
	"crypto/rand"
	"encoding/hex"
	"regexp"
)

var objectIDPattern = regexp.MustCompile(`^[a-f0-9]{24}$`)

func NewID() string {
	b := make([]byte, 12)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func ValidID(id string) bool {
	return objectIDPattern.MatchString(id)
}

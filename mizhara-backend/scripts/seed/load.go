package seed

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

func DataDir() string {
	return filepath.Join("scripts", "seed", "data")
}

func loadJSON[T any](filename string) (T, error) {
	var out T
	path := filepath.Join(DataDir(), filename)
	b, err := os.ReadFile(path)
	if err != nil {
		return out, fmt.Errorf("read %s: %w", path, err)
	}
	if err := json.Unmarshal(b, &out); err != nil {
		return out, fmt.Errorf("parse %s: %w", path, err)
	}
	return out, nil
}

func LoadCategories() ([]CategorySeed, error) {
	return loadJSON[[]CategorySeed]("categories.json")
}

func LoadCustomers() ([]CustomerSeed, error) {
	return loadJSON[[]CustomerSeed]("customers.json")
}

func LoadProducts() ([]ProductSeed, error) {
	return loadJSON[[]ProductSeed]("products.json")
}

func LoadOffers() ([]OfferSeed, error) {
	return loadJSON[[]OfferSeed]("offers.json")
}

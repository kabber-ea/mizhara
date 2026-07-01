package seed

type CategorySeed struct {
	Name string `json:"name"`
}

type CustomerSeed struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
}

type ProductSeed struct {
	Name          string   `json:"name"`
	Description   string   `json:"description"`
	Category      string   `json:"category"`
	CostPrice     float64  `json:"costPrice"`
	Price         float64  `json:"price"`
	Rating        float64  `json:"rating"`
	ReviewsCount  int      `json:"reviewsCount"`
	StockQuantity int      `json:"stockQuantity"`
	Materials     []string `json:"materials"`
	Sizes         []string `json:"sizes"`
	IsFeatured    bool     `json:"isFeatured"`
}

type OfferSeed struct {
	Name            string   `json:"name"`
	Description     string   `json:"description"`
	Type            string   `json:"type"`
	Scope           string   `json:"scope"`
	Percentage      float64  `json:"percentage,omitempty"`
	FixedAmount     float64  `json:"fixedAmount,omitempty"`
	MinPurchase     float64  `json:"minPurchase,omitempty"`
	MaxDiscount     float64  `json:"maxDiscount,omitempty"`
	BuyQuantity     int      `json:"buyQuantity,omitempty"`
	FreeQuantity    int      `json:"freeQuantity,omitempty"`
	Code            string   `json:"code,omitempty"`
	IsActive        bool     `json:"isActive"`
	ProductCategories []string `json:"productCategories,omitempty"`
	ProductsPerCategory int    `json:"productsPerCategory,omitempty"`
}

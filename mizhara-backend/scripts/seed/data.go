package seed

import (
	"fmt"
	"time"

	"mizhara-backend/models"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var Categories = []string{
	"Chains", "Bracelets", "Waist Chains", "Anklets", "Rings", "Nose Pins", "Earrings", "Bangles",
}

func CategoryImage(name string) string {
	images := CategoryImages[name]
	if len(images) > 0 {
		return images[0]
	}
	return ""
}

func px(id int) string {
	return fmt.Sprintf(
		"https://images.pexels.com/photos/%d/pexels-photo-%d.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop",
		id, id,
	)
}

func us(photo string) string {
	return fmt.Sprintf("https://images.unsplash.com/%s?auto=format&fit=crop&w=800&h=800&q=80", photo)
}

// CategoryImages — each pool contains only images that match that jewelry type.
var CategoryImages = map[string][]string{
	"Chains": {
		us("photo-1599643478518-a784e5dc4c8f"),
		us("photo-1515562141203-67a3bb8b5221"),
		us("photo-1545839539-88eac4c475d5"),
		px(265906),
		px(1927259),
		px(1024960),
		px(1454227),
	},
	"Bracelets": {
		us("photo-1602173574767-37ac01994b2a"),
		us("photo-1611591437281-460bfbe1220a"),
		px(1191531),
		px(265696),
		px(371284),
		px(325111),
		px(6311576),
		px(1003414),
	},
	"Waist Chains": {
		px(14825268),
		px(8182278),
		px(6740104),
		px(3999379),
		us("photo-1599643478518-a784e5dc4c8f"),
		px(1927259),
		px(265906),
	},
	"Anklets": {
		px(7067963),
		px(6311658),
		px(7879613),
		px(9577870),
		px(4058312),
		px(3999379),
		px(6740104),
	},
	"Rings": {
		us("photo-1605100804763-247f67b3557e"),
		us("photo-1603561591411-07134e71a2a9"),
		us("photo-1573408301185-9146fe634ad0"),
		us("photo-1602751584552-8ba73aad10e1"),
		px(3266700),
		px(964792),
		px(17845823),
	},
	"Nose Pins": {
		"https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Antique_Indian_Nose_Ring_Jewellery.jpg/960px-Antique_Indian_Nose_Ring_Jewellery.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/b/b4/Gold_nose_ring_from_Rajasthan.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Small_nose_ring_example.jpg/960px-Small_nose_ring_example.jpg",
		px(14018038),
		px(4934917),
		px(9577870),
		px(1191531),
	},
	"Earrings": {
		us("photo-1535632066927-ab7c9ab60908"),
		us("photo-1545839539-88eac4c475d5"),
		px(1454227),
		px(1191531),
		px(4934917),
		px(1003414),
		px(6311576),
	},
	"Bangles": {
		us("photo-1611591437281-460bfbe1220a"),
		us("photo-1602173574767-37ac01994b2a"),
		us("photo-1611652022419-a9419f74343d"),
		px(6311658),
		px(9577870),
		px(7879613),
		px(4934917),
		px(6740104),
	},
}

var categoryAdjectives = []string{
	"Celestial", "Moonlit", "Golden", "Pearl", "Ruby", "Emerald", "Ivory", "Rose",
	"Crystal", "Velvet", "Silk", "Starlit", "Aurora", "Lotus", "Jasmine", "Saffron",
}

var categoryNouns = map[string][]string{
	"Chains":       {"Starlet Chain", "Layered Chain", "Pendant Chain", "Charm Chain", "Box Chain", "Snake Chain", "Rope Chain"},
	"Bracelets":    {"Charm Bracelet", "Tennis Bracelet", "Cuff Bracelet", "Pearl Bracelet", "Beaded Bracelet", "Link Bracelet", "Wrap Bracelet"},
	"Waist Chains": {"Belly Chain", "Kamarband", "Layered Waist Chain", "Coin Waist Chain", "Pearl Waist Chain", "Delicate Waist Chain", "Festive Waist Chain"},
	"Anklets":      {"Payal", "Charm Anklet", "Pearl Anklet", "Layered Anklet", "Ghungroo Anklet", "Delicate Anklet", "Beaded Anklet"},
	"Rings":        {"Solitaire Ring", "Stackable Ring", "Statement Ring", "Band Ring", "Cocktail Ring", "Eternity Ring", "Signet Ring"},
	"Nose Pins":    {"Stud Pin", "Hoop Pin", "Floral Pin", "Crystal Pin", "Pearl Pin", "Minimal Pin", "Festive Pin"},
	"Earrings":     {"Drop Earrings", "Stud Earrings", "Hoop Earrings", "Jhumka", "Chandbali", "Threader Earrings", "Cluster Earrings"},
	"Bangles":      {"Kada", "Stackable Bangle", "Cuff Bangle", "Pearl Bangle", "Enamel Bangle", "Filigree Bangle", "Antique Bangle"},
}

var categorySizes = map[string][]string{
	"Chains":       {"16 inches", "18 inches", "20 inches"},
	"Bracelets":    {"Adjustable", "6 inches", "7 inches"},
	"Waist Chains": {"28 inches", "30 inches", "32 inches"},
	"Anklets":      {"9 inches", "9.5 inches + Extender", "10 inches"},
	"Rings":        {"5", "6", "7", "8", "9"},
	"Nose Pins":    {"One Size"},
	"Earrings":     {"One Size"},
	"Bangles":      {"2.4 inches", "2.6 inches", "2.8 inches"},
}

var categoryMaterials = map[string][]string{
	"Chains":       {"925 Sterling Silver", "Rose Gold Plating", "Cubic Zirconia"},
	"Bracelets":    {"Alloy", "Pearl", "Rose Gold Plating"},
	"Waist Chains": {"Brass", "Gold Plating", "Crystal"},
	"Anklets":      {"925 Sterling Silver", "Ghungroo Bells", "Pearl"},
	"Rings":        {"925 Sterling Silver", "Cubic Zirconia", "Rose Gold Plating"},
	"Nose Pins":    {"Surgical Steel", "Gold Plating", "Crystal"},
	"Earrings":     {"925 Sterling Silver", "Pearl", "Cubic Zirconia"},
	"Bangles":      {"Brass", "Enamel", "Gold Plating"},
}

type SeedProduct struct {
	Name, Description, Category string
	CostPrice, Price, Rating    float64
	ReviewsCount, StockQuantity int
	Images, Materials, Sizes    []string
	IsFeatured, InStock         bool
}

type SeedCustomer struct {
	Name, Email, Phone string
}

var CustomerNames = []SeedCustomer{
	{Name: "Priya Sharma", Email: "priya.sharma@gmail.com", Phone: "9876543210"},
	{Name: "Ananya Reddy", Email: "ananya.reddy@yahoo.com", Phone: "9876543211"},
	{Name: "Kavya Nair", Email: "kavya.nair@outlook.com", Phone: "9876543212"},
	{Name: "Meera Patel", Email: "meera.patel@gmail.com", Phone: "9876543213"},
	{Name: "Riya Kapoor", Email: "riya.kapoor@yahoo.com", Phone: "9876543214"},
	{Name: "Sneha Iyer", Email: "sneha.iyer@gmail.com", Phone: "9876543215"},
	{Name: "Divya Menon", Email: "divya.menon@outlook.com", Phone: "9876543216"},
	{Name: "Aisha Khan", Email: "aisha.khan@gmail.com", Phone: "9876543217"},
	{Name: "Neha Gupta", Email: "neha.gupta@yahoo.com", Phone: "9876543218"},
	{Name: "Pooja Singh", Email: "pooja.singh@gmail.com", Phone: "9876543219"},
	{Name: "Shruti Desai", Email: "shruti.desai@outlook.com", Phone: "9876543220"},
	{Name: "Tanvi Joshi", Email: "tanvi.joshi@gmail.com", Phone: "9876543221"},
	{Name: "Isha Verma", Email: "isha.verma@yahoo.com", Phone: "9876543222"},
	{Name: "Aditi Rao", Email: "aditi.rao@gmail.com", Phone: "9876543223"},
	{Name: "Nisha Agarwal", Email: "nisha.agarwal@outlook.com", Phone: "9876543224"},
	{Name: "Lakshmi Krishnan", Email: "lakshmi.k@gmail.com", Phone: "9876543225"},
	{Name: "Harini Subramanian", Email: "harini.s@yahoo.com", Phone: "9876543226"},
	{Name: "Swati Bhat", Email: "swati.bhat@gmail.com", Phone: "9876543227"},
	{Name: "Deepika Malhotra", Email: "deepika.m@outlook.com", Phone: "9876543228"},
	{Name: "Sakshi Choudhary", Email: "sakshi.c@gmail.com", Phone: "9876543229"},
	{Name: "Vidya Pillai", Email: "vidya.pillai@yahoo.com", Phone: "9876543230"},
	{Name: "Radha Murthy", Email: "radha.murthy@gmail.com", Phone: "9876543231"},
	{Name: "Gayatri Das", Email: "gayatri.das@outlook.com", Phone: "9876543232"},
	{Name: "Kritika Saxena", Email: "kritika.saxena@gmail.com", Phone: "9876543233"},
	{Name: "Bhavna Shah", Email: "bhavna.shah@yahoo.com", Phone: "9876543234"},
	{Name: "Mansi Trivedi", Email: "mansi.trivedi@gmail.com", Phone: "9876543235"},
	{Name: "Jhanvi Mehta", Email: "jhanvi.mehta@outlook.com", Phone: "9876543236"},
	{Name: "Simran Kaur", Email: "simran.kaur@gmail.com", Phone: "9876543237"},
	{Name: "Nandini Bose", Email: "nandini.bose@yahoo.com", Phone: "9876543238"},
	{Name: "Trisha Mukherjee", Email: "trisha.m@gmail.com", Phone: "9876543239"},
	{Name: "Aparna Hegde", Email: "aparna.hegde@outlook.com", Phone: "9876543240"},
	{Name: "Charu Sinha", Email: "charu.sinha@gmail.com", Phone: "9876543241"},
	{Name: "Diya Banerjee", Email: "diya.banerjee@yahoo.com", Phone: "9876543242"},
	{Name: "Esha Dutta", Email: "esha.dutta@gmail.com", Phone: "9876543243"},
	{Name: "Falguni Rane", Email: "falguni.rane@outlook.com", Phone: "9876543244"},
	{Name: "Geeta Pawar", Email: "geeta.pawar@gmail.com", Phone: "9876543245"},
	{Name: "Hema Chakraborty", Email: "hema.c@yahoo.com", Phone: "9876543246"},
	{Name: "Indira Prasad", Email: "indira.prasad@gmail.com", Phone: "9876543247"},
	{Name: "Juhi Anand", Email: "juhi.anand@outlook.com", Phone: "9876543248"},
	{Name: "Komal Thakur", Email: "komal.thakur@gmail.com", Phone: "9876543249"},
}

// GenerateProducts builds 56 products (7 per category) with category-appropriate images.
func GenerateProducts() []SeedProduct {
	var products []SeedProduct
	idx := 0
	for _, category := range Categories {
		nouns := categoryNouns[category]
		images := CategoryImages[category]
		for i, noun := range nouns {
			adj := categoryAdjectives[(idx+i)%len(categoryAdjectives)]
			name := fmt.Sprintf("%s %s", adj, noun)
			price := 499.0 + float64((idx*137+i*89)%3500)
			cost := price * 0.35
			rating := 4.2 + float64((idx+i)%8)*0.1
			stock := 15 + (idx+i)%45
			products = append(products, SeedProduct{
				Name:        name,
				Description: fmt.Sprintf("Handcrafted %s from Mizhara's %s collection. Perfect for festive occasions and everyday elegance.", noun, category),
				Category:    category,
				CostPrice:   cost,
				Price:       price,
				Rating:      rating,
				ReviewsCount: 8 + (idx+i)*3,
				StockQuantity: stock,
				Images:      []string{images[i%len(images)]},
				Materials:   categoryMaterials[category],
				Sizes:       categorySizes[category],
				IsFeatured:  i < 4,
				InStock:     stock > 0,
			})
			idx++
		}
	}
	return products
}

func productIDsByCategories(productByID map[primitive.ObjectID]models.Product, categories []string, perCategory int) []string {
	var ids []string
	for _, cat := range categories {
		n := 0
		for id, p := range productByID {
			if p.Category != cat {
				continue
			}
			ids = append(ids, id.Hex())
			n++
			if perCategory > 0 && n >= perCategory {
				break
			}
		}
	}
	return ids
}

func GenerateOffers(now time.Time, productByID map[primitive.ObjectID]models.Product) []models.Offer {
	ringIDs := productIDsByCategories(productByID, []string{"Rings"}, 5)
	selectedIDs := productIDsByCategories(productByID, []string{"Anklets", "Earrings"}, 3)
	bangleIDs := productIDsByCategories(productByID, []string{"Bangles"}, 0)
	isActive := true

	return []models.Offer{
		{
			ID: primitive.NewObjectID(), Name: "Festive Edit Sale",
			Description: "20% off every piece — applied automatically at checkout.",
			Type: models.OfferTypePercentage, Scope: models.OfferScopeAll, Percentage: 20,
			IsActive: &isActive, CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: primitive.NewObjectID(), Name: "Welcome to Mizhara",
			Description: "15% off anklets and earrings with code MIZHARA15.",
			Type: models.OfferTypePercentage, Scope: models.OfferScopeSelected, Percentage: 15,
			ProductIDs: selectedIDs, Code: "MIZHARA15",
			IsActive: &isActive, CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: primitive.NewObjectID(), Name: "Ring Duo Deal",
			Description: "Buy 2 rings, get 1 free on selected styles.",
			Type: models.OfferTypeBogo, Scope: models.OfferScopeSelected,
			BuyQuantity: 2, FreeQuantity: 1, ProductIDs: ringIDs,
			IsActive: &isActive, CreatedAt: now, UpdatedAt: now,
		},
		{
			ID: primitive.NewObjectID(), Name: "Bangle Bundle",
			Description: "Buy 3 bangles, get 1 free — stack your wrist stack.",
			Type: models.OfferTypeBogo, Scope: models.OfferScopeSelected,
			BuyQuantity: 3, FreeQuantity: 1, ProductIDs: bangleIDs,
			IsActive: &isActive, CreatedAt: now, UpdatedAt: now,
		},
	}
}

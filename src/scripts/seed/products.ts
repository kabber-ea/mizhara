const img = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// Verified working Unsplash IDs (category-appropriate jewelry photos)
const JEWELRY_IMAGES = {
  chain: [
    img("photo-1599643478518-a784e5dc4c8f"),
    img("photo-1739194840257-0035eaafc61e"),
    img("photo-1769116416641-e714b71851e8"),
    img("photo-1770722272510-ef28c6f57541"),
    img("photo-1506630448388-4e683c67ddb0"),
  ],
  bracelet: [
    img("photo-1611591437281-460bfbe1220a"),
    img("photo-1745270143445-63ccdffbfbca"),
    img("photo-1573408301185-9146fe634ad0"),
    img("photo-1611085583191-a3b181a88401"),
    img("photo-1506630448388-4e683c67ddb0"),
  ],
  waist: [
    img("photo-1739194840257-0035eaafc61e"),
    img("photo-1770722272510-ef28c6f57541"),
    img("photo-1769116416641-e714b71851e8"),
    img("photo-1599643478518-a784e5dc4c8f"),
  ],
  anklet: [
    img("photo-1611085583191-a3b181a88401"),
    img("photo-1611591437281-460bfbe1220a"),
    img("photo-1573408301185-9146fe634ad0"),
    img("photo-1506630448388-4e683c67ddb0"),
  ],
  ring: [
    img("photo-1605100804763-247f67b3557e"),
    img("photo-1608043152269-423dbba4e7e1"),
    img("photo-1745270143445-63ccdffbfbca"),
    img("photo-1739194840257-0035eaafc61e"),
    img("photo-1770722272510-ef28c6f57541"),
  ],
  nose: [
    img("photo-1573408301185-9146fe634ad0"),
    img("photo-1611085583191-a3b181a88401"),
    img("photo-1506630448388-4e683c67ddb0"),
  ],
  earring: [
    img("photo-1770722272510-ef28c6f57541"),
    img("photo-1739194840257-0035eaafc61e"),
    img("photo-1745270143445-63ccdffbfbca"),
    img("photo-1611591437281-460bfbe1220a"),
  ],
  bangle: [
    img("photo-1611591437281-460bfbe1220a"),
    img("photo-1506630448388-4e683c67ddb0"),
    img("photo-1769116416641-e714b71851e8"),
    img("photo-1611085583191-a3b181a88401"),
  ],
};

type SeedProduct = {
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  materials: string[];
  sizes: string[];
  isFeatured: boolean;
  inStock: boolean;
};

function pickImages(category: string, index: number): string[] {
  const key = category.toLowerCase();
  if (key === "waist chains") return [JEWELRY_IMAGES.waist[index % JEWELRY_IMAGES.waist.length]];
  if (key === "chains") return [JEWELRY_IMAGES.chain[index % JEWELRY_IMAGES.chain.length]];
  if (key === "bracelets") return [JEWELRY_IMAGES.bracelet[index % JEWELRY_IMAGES.bracelet.length]];
  if (key === "anklets") return [JEWELRY_IMAGES.anklet[index % JEWELRY_IMAGES.anklet.length]];
  if (key === "rings") return [JEWELRY_IMAGES.ring[index % JEWELRY_IMAGES.ring.length]];
  if (key === "nose pins") return [JEWELRY_IMAGES.nose[index % JEWELRY_IMAGES.nose.length]];
  if (key === "earrings") return [JEWELRY_IMAGES.earring[index % JEWELRY_IMAGES.earring.length]];
  if (key === "bangles") return [JEWELRY_IMAGES.bangle[index % JEWELRY_IMAGES.bangle.length]];
  return [JEWELRY_IMAGES.chain[0]];
}

const ORNAMENTS_PER_CATEGORY = 15;

type CategorySeedConfig = {
  category: string;
  adjectives: string[];
  styles: string[];
  materials: string[][];
  sizes: string[][];
  priceMin: number;
  priceMax: number;
  descriptions: string[];
};

const CATEGORY_CONFIG: CategorySeedConfig[] = [
  {
    category: "Chains",
    adjectives: ["Celestial", "Royal", "Pearl", "Temple", "Infinity", "Layered", "Vintage", "Minimal", "Kundan", "Starlit", "Heritage", "Crystal", "Moonbeam", "Golden", "Floral"],
    styles: ["Starlet Chain", "Layered Chain", "Cascade Chain", "Snake Chain", "Coin Chain", "Pendant Chain", "Choker Chain", "Rolo Chain", "Box Chain", "Charm Chain", "Beaded Chain", "Long Chain", "Mangalsutra Chain", "Heart Chain", "Evil Eye Chain"],
    materials: [["925 Sterling Silver", "Rose Gold Plating"], ["Gold Tone Brass", "Kundan Stones"], ["Freshwater Pearls", "Gold Plated Chain"], ["Stainless Steel", "18k Gold Plating"], ["Crystals", "Rhodium Silver"]],
    sizes: [["16 inches", "18 inches"], ["18 inches", "20 inches"], ["20 inches", "22 inches"], ["14 inches", "16 inches"]],
    priceMin: 1499,
    priceMax: 5999,
    descriptions: [
      "A delicate chain designed for everyday elegance and festive layering.",
      "Hand-finished links that catch light beautifully with every movement.",
      "Inspired by Indian heritage motifs with a modern Mizhara twist.",
      "Perfect for pairing with pendants or wearing solo as a statement piece.",
    ],
  },
  {
    category: "Bracelets",
    adjectives: ["Meadow", "Evil Eye", "Polki", "Pearl", "Charm", "Tennis", "Kada", "Crystal", "Floral", "Heritage", "Boho", "Minimal", "Royal", "Starlight", "Vintage"],
    styles: ["Flower Bracelet", "Tennis Bracelet", "Cuff Bracelet", "Charm Bracelet", "Kada Bracelet", "Beaded Bracelet", "Chain Bracelet", "Evil Eye Bracelet", "Polki Bracelet", "Pearl Bracelet", "Crystal Bracelet", "Adjustable Bracelet", "Stack Bracelet", "Ghungroo Bracelet", "Enamel Bracelet"],
    materials: [["Brass Base", "Enamel", "Crystals"], ["Glass Beads", "Gold Tone"], ["Polki Stones", "Gold Tone Metal"], ["Freshwater Pearls", "Sterling Silver"], ["Rhodium Silver", "CZ"]],
    sizes: [["Adjustable 6.5-8 inches"], ["7 inches", "7.5 inches"], ["One Size"], ["2.4 inch diameter"]],
    priceMin: 799,
    priceMax: 4499,
    descriptions: [
      "A wrist adornment crafted to add sparkle to both casual and festive looks.",
      "Comfortable fit with secure clasp for all-day wear.",
      "Features premium plating that resists tarnish with proper care.",
      "Designed to stack beautifully with other Mizhara pieces.",
    ],
  },
  {
    category: "Waist Chains",
    adjectives: ["Glimmering", "Gold", "Crystal", "Bridal", "Temple", "Pearl", "Kundan", "Boho", "Royal", "Dewdrop", "Heritage", "Festive", "Layered", "Antique", "Sparkle"],
    styles: ["Waist Chain", "Kamarbandh", "Belly Chain", "Hip Chain", "Ghungroo Chain", "Pearl Waist Chain", "Polki Kamarbandh", "Crystal Body Chain", "Layered Kamarbandh", "Bridal Waist Chain", "Temple Waist Chain", "Adjustable Belly Chain", "Minimal Waist Chain", "Festive Kamarbandh", "Royal Body Chain"],
    materials: [["Stainless Steel", "Glass Beads"], ["Gold Tone", "Ghungroo Bells"], ["Crystals", "Gold Plated Chain"], ["Gold Tone", "Polki", "Pearls"], ["Pearls", "Antique Gold Finish"]],
    sizes: [["26+6 extender", "32+6 extender"], ["28-34 adjustable"], ["One Size Adjustable"], ["30+8 extender"]],
    priceMin: 1799,
    priceMax: 6999,
    descriptions: [
      "An elegant waist chain to complement sarees, lehengas, and crop styles.",
      "Adjustable length ensures a comfortable fit for various waist sizes.",
      "Adds a graceful shimmer that moves beautifully as you walk.",
      "A festive essential for weddings, receptions, and celebrations.",
    ],
  },
  {
    category: "Anklets",
    adjectives: ["Moonlight", "Ghungroo", "Layered", "Silver", "Crystal", "Pearl", "Boho", "Temple", "Minimal", "Royal", "Starlight", "Beaded", "Heritage", "Golden", "Charm"],
    styles: ["Anklet", "Payal", "Bead Anklet", "Ghungroo Payal", "Layered Anklet", "Charm Anklet", "Pearl Payal", "Crystal Anklet", "Toe Ring Anklet", "Temple Payal", "Minimal Anklet", "Boho Anklet", "Kundan Payal", "Chain Anklet", "Festive Payal"],
    materials: [["925 Silver", "Rhodium Plating"], ["Silver Tone", "Ghungroo"], ["Glass Beads", "Cotton Thread"], ["Gold Tone", "Crystals"], ["Pearls", "Sterling Silver"]],
    sizes: [["9.5+2 extender"], ["10 inches adjustable"], ["One Size"], ["9 inches", "10 inches"]],
    priceMin: 499,
    priceMax: 2499,
    descriptions: [
      "A delicate anklet that adds a musical charm to every step.",
      "Hypoallergenic materials suitable for sensitive skin.",
      "Perfect for barefoot sandals, ethnic wear, and daily styling.",
      "Crafted with attention to comfort and secure fastening.",
    ],
  },
  {
    category: "Rings",
    adjectives: ["Rose Gold", "Vintage", "Stackable", "Pearl", "Couple", "Oval", "Solitaire", "Emerald", "Ruby", "Sapphire", "Minimal", "Cocktail", "Temple", "Crystal", "Heritage"],
    styles: ["Solitaire Ring", "Cluster Ring", "Band Ring", "Cocktail Ring", "Midi Ring", "Statement Ring", "Engagement Ring", "Stack Ring", "Pearl Ring", "Stone Ring", "Adjustable Ring", "Vintage Ring", "Temple Ring", "Couple Band", "Eternity Ring"],
    materials: [["Rose Gold Plated Silver", "CZ"], ["Gold Tone", "Green Glass Stone"], ["Gold Tone Alloy"], ["Freshwater Pearls", "Gold Plating"], ["Sterling Silver", "CZ"]],
    sizes: [["6", "7", "8", "9"], ["7", "8"], ["One Size Set"], ["6-9 set"], ["Adjustable"]],
    priceMin: 599,
    priceMax: 3999,
    descriptions: [
      "A beautifully crafted ring that elevates any hand gesture.",
      "Nickel-free and lead-free for comfortable everyday wear.",
      "Designed to pair with Mizhara bracelets and bangles.",
      "Available in multiple sizes for the perfect fit.",
    ],
  },
  {
    category: "Nose Pins",
    adjectives: ["Dreamy", "Floral", "Crystal", "Diamond Look", "Pearl", "Kundan", "Minimal", "Vintage", "Gold", "Silver", "Stud", "Hooped", "Traditional", "Modern", "Sparkle"],
    styles: ["Nose Pin", "Nath", "Stud Pin", "Screw Pin", "L-Shape Pin", "Kundan Nath", "Pearl Nose Pin", "Crystal Stud", "Floral Nath", "Minimal Pin", "Hooped Nath", "Chain Nath", "Diamond Pin", "Gold Stud", "Silver Pin"],
    materials: [["925 Silver", "Pearl"], ["Kundan", "Gold Tone"], ["Surgical Steel", "Crystal"], ["Surgical Steel", "CZ"], ["Gold Plated Brass", "Enamel"]],
    sizes: [["One Size"], ["Standard Gauge"], ["Thin Wire"], ["Screw Back"]],
    priceMin: 249,
    priceMax: 1299,
    descriptions: [
      "A dainty nose pin for subtle everyday sparkle.",
      "Lightweight design for comfortable extended wear.",
      "Crafted with hypoallergenic surgical steel options.",
      "Traditional and modern styles for every preference.",
    ],
  },
  {
    category: "Earrings",
    adjectives: ["Chandbali", "Hoop", "Jhumka", "Threader", "Drop", "Pearl", "Kundan", "Crystal", "Temple", "Minimal", "Statement", "Floral", "Heritage", "Royal", "Festive"],
    styles: ["Earrings", "Chandbali", "Jhumka", "Hoop Set", "Threader Earrings", "Drop Earrings", "Stud Earrings", "Dangler Earrings", "Kundan Earrings", "Pearl Drops", "Ghungroo Jhumka", "Huggie Earrings", "Cluster Earrings", "Temple Earrings", "Crystal Drops"],
    materials: [["Gold Tone", "Pearls", "Kundan"], ["Gold Plated Brass"], ["Gold Tone", "Ghungroo"], ["Sterling Silver", "Pearl"], ["Crystals", "Rhodium Silver"]],
    sizes: [["One Size"], ["One Size Set"], ["Lightweight Pair"], ["Push Back"]],
    priceMin: 699,
    priceMax: 4999,
    descriptions: [
      "Earrings designed to frame your face with radiant elegance.",
      "Secure closure for comfortable all-day and evening wear.",
      "Inspired by Indian craftsmanship with contemporary flair.",
      "A must-have for weddings, parties, and special occasions.",
    ],
  },
  {
    category: "Bangles",
    adjectives: ["Lac", "Gold Plated", "Kundan", "Oxidized", "Crystal", "Temple", "Pearl", "Heritage", "Royal", "Floral", "Bridal", "Minimal", "Stack", "Antique", "Festive"],
    styles: ["Kada Bangle", "Bangle Set", "Bangle Pair", "Tribal Bangle", "Lac Bangle", "Kundan Bangle", "Crystal Bangle", "Temple Kada", "Pearl Bangle", "Stack Bangle", "Adjustable Bangle", "Bridal Kada", "Oxidized Bangle", "Thin Bangle Set", "Statement Kada"],
    materials: [["Lac", "Mirror Work"], ["Gold Plated Brass"], ["Kundan Stones", "Gold Tone"], ["Oxidized Silver Tone"], ["Pearls", "Gold Plating"]],
    sizes: [["2.6 inch", "2.8 inch"], ["2.4 inch set"], ["2.6 inch"], ["Adjustable"], ["2.2 inch", "2.4 inch"]],
    priceMin: 399,
    priceMax: 4499,
    descriptions: [
      "A bangle that adds traditional charm to any ethnic ensemble.",
      "Smooth inner finish for comfortable wrist wear.",
      "Perfect for stacking or wearing as a standalone statement.",
      "Crafted for festivals, weddings, and daily ethnic looks.",
    ],
  },
];

function seededValue(min: number, max: number, index: number, salt: number): number {
  const range = max - min;
  return min + ((index * 17 + salt * 13) % (range + 1));
}

function buildCategoryProducts(config: CategorySeedConfig, globalOffset: number): SeedProduct[] {
  return Array.from({ length: ORNAMENTS_PER_CATEGORY }, (_, i) => {
    const adj = config.adjectives[i % config.adjectives.length];
    const style = config.styles[i % config.styles.length];
    const materials = config.materials[i % config.materials.length];
    const sizes = config.sizes[i % config.sizes.length];
    const description = config.descriptions[i % config.descriptions.length];
    const price = seededValue(config.priceMin, config.priceMax, i, globalOffset);
    const rating = Number((4.4 + ((i + globalOffset) % 6) * 0.1).toFixed(1));
    const reviewsCount = seededValue(25, 350, i, globalOffset + 3);
    const isFeatured = i % 3 === 0 || i === 1;

    return {
      name: `${adj} ${style}`,
      description,
      category: config.category,
      price,
      rating: Math.min(rating, 5),
      reviewsCount,
      materials,
      sizes,
      isFeatured,
      inStock: i % 12 !== 11,
      images: pickImages(config.category, globalOffset + i),
    };
  });
}

export const SEED_PRODUCTS: SeedProduct[] = CATEGORY_CONFIG.flatMap((config, categoryIndex) =>
  buildCategoryProducts(config, categoryIndex * 100)
);

export const PRODUCTS_PER_CATEGORY = ORNAMENTS_PER_CATEGORY;

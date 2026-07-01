export type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export type SerializedProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  bannerImage?: string;
  bannerImageMobile?: string;
  materials: string[];
  sizes: string[];
  isFeatured: boolean;
  isActive: boolean;
  stockQuantity: number;
  inStock: boolean;
  updatedAt?: string;
};

export type AdminProduct = SerializedProduct & {
  costPrice: number;
};

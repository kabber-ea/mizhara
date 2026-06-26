export type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string;
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
  materials: string[];
  sizes: string[];
  isFeatured: boolean;
  stockQuantity: number;
  inStock: boolean;
};

export type ProductInput = {
  id?: string;
  name: string;
  description?: string;
  category: string;
  costPrice?: number;
  price: number;
  materials?: string[];
  sizes?: string[];
  images?: string[];
  isFeatured?: boolean;
  stockQuantity?: number;
  inStock?: boolean;
  rating?: number;
  reviewsCount?: number;
};

export type AdminProduct = SerializedProduct & {
  costPrice: number;
};

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
  inStock: boolean;
};

export type ProductInput = {
  id?: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  materials?: string[];
  sizes?: string[];
  images?: string[];
  isFeatured?: boolean;
  inStock?: boolean;
  rating?: number;
  reviewsCount?: number;
};

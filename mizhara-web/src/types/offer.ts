export type OfferType = "percentage" | "fixed" | "bogo";
export type OfferScope = "all" | "selected";

export type Offer = {
  id: string;
  name: string;
  description: string;
  image?: string;
  type: OfferType;
  scope: OfferScope;
  percentage?: number;
  fixedAmount?: number;
  minPurchase?: number;
  maxDiscount?: number;
  buyQuantity?: number;
  freeQuantity?: number;
  productIds?: string[];
  code?: string;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type OfferInput = {
  id?: string;
  name: string;
  description: string;
  image?: string;
  type: OfferType;
  scope: OfferScope;
  percentage: number;
  fixedAmount: number;
  minPurchase: number;
  maxDiscount: number;
  buyQuantity: number;
  freeQuantity: number;
  productIds: string[];
  code: string;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

export type OfferPreview = {
  subtotal: number;
  discountAmount: number;
  total: number;
  offerId?: string;
  offerName?: string;
  offerLabel?: string;
};

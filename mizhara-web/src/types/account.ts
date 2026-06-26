import type { SerializedOrder } from "@/types/admin";

export type SavedAddress = {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export type CustomerProfile = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  savedAddress?: SavedAddress;
};

export type CustomerOrder = Pick<
  SerializedOrder,
  | "id"
  | "orderNumber"
  | "items"
  | "itemCount"
  | "total"
  | "paymentStatus"
  | "deliveryStatus"
  | "trackingUrl"
  | "trackingNumber"
  | "trackingProvider"
  | "createdAt"
>;

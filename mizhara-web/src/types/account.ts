import type { SerializedOrder } from "@/types/admin";

export const MAX_SAVED_ADDRESSES = 5;

export type SavedAddress = {
  id: string;
  label?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

export type CustomerProfile = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  /** Default address — kept for backward compatibility */
  savedAddress?: Partial<SavedAddress>;
  savedAddresses?: SavedAddress[];
};

export function getDefaultSavedAddress(addresses: SavedAddress[] | undefined): SavedAddress | undefined {
  if (!addresses?.length) return undefined;
  return addresses.find((a) => a.isDefault) ?? addresses[0];
}

export function newSavedAddressId() {
  return crypto.randomUUID();
}

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

import type { DeliveryStatus, IOrder, PaymentStatus, TrackingProvider } from "@/models/Order";

export type SerializedCustomer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
};

export type SerializedOrder = {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  items: IOrder["items"];
  itemCount: number;
  shippingAddress: IOrder["shippingAddress"];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  trackingProvider?: TrackingProvider;
  trackingNumber?: string;
  trackingUrl?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

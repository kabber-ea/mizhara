export type DeliveryStatus =
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus = "pending" | "paid" | "failed";

export type TrackingProvider =
  | "delhivery"
  | "bluedart"
  | "dtdc"
  | "indiapost"
  | "shiprocket"
  | "other";

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
  category?: string;
}

export interface IShippingAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IOrder {
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  trackingProvider?: TrackingProvider;
  trackingNumber?: string;
  trackingUrl?: string;
}

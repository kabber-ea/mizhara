import mongoose, { Schema, models, model, Types } from "mongoose";

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
  userId: Types.ObjectId;
  orderNumber: string;
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
  shippedAt?: Date;
  deliveredAt?: Date;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
        size: String,
        image: String,
        category: String,
      },
    ],
    shippingAddress: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    deliveryStatus: {
      type: String,
      enum: [
        "processing",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "processing",
    },
    trackingProvider: {
      type: String,
      enum: ["delhivery", "bluedart", "dtdc", "indiapost", "shiprocket", "other"],
    },
    trackingNumber: String,
    trackingUrl: String,
    shippedAt: Date,
    deliveredAt: Date,
    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  { timestamps: true }
);

OrderSchema.index({ deliveryStatus: 1, createdAt: -1 });
OrderSchema.index({ userId: 1 });

export default models.Order || model<IOrder>("Order", OrderSchema);

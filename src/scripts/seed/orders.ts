import type { Types } from "mongoose";
import type { IProduct } from "@/models/Product";
import type {
  DeliveryStatus,
  PaymentStatus,
  TrackingProvider,
} from "@/models/Order";
import { buildTrackingUrl } from "@/lib/tracking";

const CITIES = [
  { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  { city: "Bengaluru", state: "Karnataka", pincode: "560001" },
  { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  { city: "Hyderabad", state: "Telangana", pincode: "500001" },
  { city: "Kolkata", state: "West Bengal", pincode: "700001" },
  { city: "Pune", state: "Maharashtra", pincode: "411001" },
  { city: "Jaipur", state: "Rajasthan", pincode: "302001" },
  { city: "Kochi", state: "Kerala", pincode: "682001" },
];

const DELIVERY_STATUSES: DeliveryStatus[] = [
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

const PAYMENT_STATUSES: PaymentStatus[] = ["paid", "paid", "paid", "paid", "pending", "failed"];

const TRACKING_SAMPLES: { provider: TrackingProvider; number: string }[] = [
  { provider: "delhivery", number: "DLV1234567890" },
  { provider: "bluedart", number: "BD9876543210" },
  { provider: "dtdc", number: "D12345678901" },
  { provider: "indiapost", number: "EE123456789IN" },
  { provider: "shiprocket", number: "SRK456789012" },
  { provider: "delhivery", number: "DLV9988776655" },
  { provider: "bluedart", number: "BD1122334455" },
  { provider: "dtdc", number: "D99887766554" },
  { provider: "shiprocket", number: "SRK7788990011" },
  { provider: "delhivery", number: "DLV5544332211" },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickProducts(products: IProduct[], count: number) {
  const shuffled = [...products].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(Math.floor(Math.random() * 12) + 9, Math.floor(Math.random() * 60), 0, 0);
  return d;
}

export function buildSeedOrders(
  customerUsers: { _id: Types.ObjectId; name: string; email?: string; phone?: string }[],
  products: IProduct[]
) {
  const orders = [];
  const orderCount = 45;

  for (let i = 0; i < orderCount; i++) {
    const customer = customerUsers[i % customerUsers.length];
    const location = CITIES[i % CITIES.length];
    const lineItems = pickProducts(products, Math.floor(Math.random() * 3) + 1).map((p) => ({
      productId: String((p as unknown as { _id: Types.ObjectId })._id),
      name: p.name,
      price: p.price,
      quantity: Math.floor(Math.random() * 2) + 1,
      size: p.sizes[0] ?? "One Size",
      image: p.images[0] ?? "",
      category: p.category,
    }));

    const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const paymentStatus = pickRandom(PAYMENT_STATUSES);
    let deliveryStatus = pickRandom(DELIVERY_STATUSES);

    if (paymentStatus !== "paid") {
      deliveryStatus = paymentStatus === "failed" ? "cancelled" : "processing";
    }

    const createdAt = daysAgo(Math.floor(Math.random() * 60));
    const orderNumber = `MIZ-SEED-${String(i + 1).padStart(4, "0")}`;

    const order: Record<string, unknown> = {
      userId: customer._id,
      orderNumber,
      items: lineItems,
      shippingAddress: {
        name: customer.name,
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        address: `${100 + i} MG Road, ${location.city}`,
        city: location.city,
        state: location.state,
        pincode: location.pincode,
      },
      subtotal,
      shipping: 0,
      total: subtotal,
      currency: "INR",
      paymentStatus,
      deliveryStatus,
      createdAt,
      updatedAt: createdAt,
    };

    if (paymentStatus === "paid") {
      order.razorpayOrderId = `order_seed_${i + 1}`;
      order.razorpayPaymentId = `pay_seed_${i + 1}`;
    }

    const trackableStatuses: DeliveryStatus[] = ["shipped", "out_for_delivery", "delivered"];
    if (trackableStatuses.includes(deliveryStatus) && i < TRACKING_SAMPLES.length + 5) {
      const tracking = TRACKING_SAMPLES[i % TRACKING_SAMPLES.length];
      order.trackingProvider = tracking.provider;
      order.trackingNumber = `${tracking.number}${i}`;
      order.trackingUrl = buildTrackingUrl(tracking.provider, `${tracking.number}${i}`);
      order.shippedAt = new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000);
      if (deliveryStatus === "delivered") {
        order.deliveredAt = new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000);
      }
    }

    orders.push(order);
  }

  return orders;
}

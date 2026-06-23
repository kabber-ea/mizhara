import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Order, { type DeliveryStatus, type IOrder, type TrackingProvider } from "@/models/Order";
import { buildPaginationMeta } from "@/lib/pagination";
import { buildTrackingUrl } from "@/lib/tracking";
import type { SerializedOrder } from "@/types/admin";

function serializeOrder(doc: Record<string, unknown>): SerializedOrder {
  const user = doc.user as Record<string, unknown> | undefined;
  const items = (doc.items as IOrder["items"]) ?? [];

  return {
    id: String(doc._id),
    orderNumber: doc.orderNumber as string,
    userId: String(doc.userId),
    customerName:
      (user?.name as string) ?? (doc.shippingAddress as IOrder["shippingAddress"])?.name ?? "—",
    customerEmail:
      (user?.email as string) ?? (doc.shippingAddress as IOrder["shippingAddress"])?.email,
    customerPhone:
      (user?.phone as string) ?? (doc.shippingAddress as IOrder["shippingAddress"])?.phone,
    items,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    shippingAddress: doc.shippingAddress as IOrder["shippingAddress"],
    subtotal: doc.subtotal as number,
    shipping: doc.shipping as number,
    total: doc.total as number,
    currency: doc.currency as string,
    paymentStatus: doc.paymentStatus as SerializedOrder["paymentStatus"],
    deliveryStatus: doc.deliveryStatus as SerializedOrder["deliveryStatus"],
    trackingProvider: doc.trackingProvider as TrackingProvider | undefined,
    trackingNumber: doc.trackingNumber as string | undefined,
    trackingUrl: doc.trackingUrl as string | undefined,
    shippedAt: doc.shippedAt ? new Date(doc.shippedAt as string).toISOString() : undefined,
    deliveredAt: doc.deliveredAt ? new Date(doc.deliveredAt as string).toISOString() : undefined,
    createdAt: new Date(doc.createdAt as string).toISOString(),
    updatedAt: new Date(doc.updatedAt as string).toISOString(),
  };
}

export async function listOrders(params: {
  page: number;
  limit: number;
  skip: number;
  search: string;
  deliveryStatus?: string;
  paymentStatus?: string;
}) {
  await dbConnect();

  const match: Record<string, unknown> = {};
  if (params.deliveryStatus && params.deliveryStatus !== "all") {
    match.deliveryStatus = params.deliveryStatus;
  }
  if (params.paymentStatus && params.paymentStatus !== "all") {
    match.paymentStatus = params.paymentStatus;
  }

  const pipeline: mongoose.PipelineStage[] = [
    { $match: match },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
  ];

  if (params.search) {
    const regex = new RegExp(params.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    pipeline.push({
      $match: {
        $or: [
          { orderNumber: regex },
          { "user.name": regex },
          { "user.email": regex },
          { "user.phone": regex },
          { "shippingAddress.name": regex },
          { "shippingAddress.email": regex },
          { "shippingAddress.phone": regex },
        ],
      },
    });
  }

  pipeline.push({ $sort: { createdAt: -1 } });

  const countPipeline = [...pipeline, { $count: "total" }];
  const [countResult] = await Order.aggregate(countPipeline);
  const total = countResult?.total ?? 0;

  pipeline.push({ $skip: params.skip }, { $limit: params.limit });
  const orders = await Order.aggregate(pipeline);

  return {
    items: orders.map((o) => serializeOrder(o as Record<string, unknown>)),
    pagination: buildPaginationMeta(params.page, params.limit, total),
  };
}

export async function getOrderById(id: string) {
  await dbConnect();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  const orders = await Order.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
  ]);

  if (!orders.length) return null;
  return serializeOrder(orders[0] as Record<string, unknown>);
}

export async function updateOrderFulfillment(
  id: string,
  body: {
    deliveryStatus?: DeliveryStatus;
    trackingProvider?: TrackingProvider;
    trackingNumber?: string;
    trackingUrl?: string;
  }
) {
  await dbConnect();
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  const order = await Order.findById(id);
  if (!order) return null;

  const validStatuses: DeliveryStatus[] = [
    "processing",
    "packed",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "returned",
  ];

  if (body.deliveryStatus) {
    if (!validStatuses.includes(body.deliveryStatus)) {
      throw new Error("Invalid delivery status");
    }
    order.deliveryStatus = body.deliveryStatus;
    if (body.deliveryStatus === "shipped" && !order.shippedAt) {
      order.shippedAt = new Date();
    }
    if (body.deliveryStatus === "delivered") {
      order.deliveredAt = new Date();
    }
  }

  if (body.trackingProvider !== undefined) order.trackingProvider = body.trackingProvider;
  if (body.trackingNumber !== undefined) order.trackingNumber = body.trackingNumber;

  const provider = body.trackingProvider ?? order.trackingProvider;
  const number = body.trackingNumber ?? order.trackingNumber;

  if (provider && number) {
    order.trackingUrl =
      buildTrackingUrl(provider, number, body.trackingUrl) ?? body.trackingUrl ?? order.trackingUrl;
  } else if (body.trackingUrl !== undefined) {
    order.trackingUrl = body.trackingUrl;
  }

  await order.save();
  return getOrderById(id);
}

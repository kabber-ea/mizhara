import crypto from "crypto";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { getRazorpay } from "@/lib/razorpay";
import { toPaise } from "@/lib/format";

function generateOrderNumber() {
  return `MIZ-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
}

export async function createPaymentOrder(
  userId: string,
  input: {
    items: unknown[];
    shippingAddress: unknown;
    subtotal: number;
  }
) {
  await dbConnect();

  const total = Number(input.subtotal) || 0;
  const orderNumber = generateOrderNumber();

  const order = await Order.create({
    userId,
    orderNumber,
    items: input.items,
    shippingAddress: input.shippingAddress,
    subtotal: total,
    shipping: 0,
    total,
    currency: "INR",
    paymentStatus: "pending",
    deliveryStatus: "processing",
  });

  const razorpay = getRazorpay();
  const razorpayOrder = await razorpay.orders.create({
    amount: toPaise(total),
    currency: "INR",
    receipt: orderNumber,
    notes: { orderId: order._id.toString() },
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  return {
    orderId: order._id.toString(),
    orderNumber,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  };
}

export async function verifyPayment(
  userId: string,
  input: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }
) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");

  if (expected !== input.razorpaySignature) {
    throw new Error("Invalid payment signature");
  }

  await dbConnect();
  const order = await Order.findOneAndUpdate(
    { razorpayOrderId: input.razorpayOrderId, userId },
    { paymentStatus: "paid", razorpayPaymentId: input.razorpayPaymentId },
    { new: true }
  );

  if (!order) {
    throw new Error("Order not found");
  }

  return { orderNumber: order.orderNumber };
}

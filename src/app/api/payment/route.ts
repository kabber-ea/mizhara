import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createPaymentOrder, verifyPayment } from "@/services/payment";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "customer") {
      return NextResponse.json({ error: "Please sign in to checkout" }, { status: 401 });
    }

    const body = await request.json();
    const { items, shippingAddress, subtotal } = body;

    if (!items?.length || !shippingAddress) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    const result = await createPaymentOrder(session.userId, { items, shippingAddress, subtotal });
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create payment order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    const result = await verifyPayment(session.userId, {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    return NextResponse.json({ success: true, orderNumber: result.orderNumber });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Payment verification failed";
    const status = message === "Invalid payment signature" || message === "Order not found" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

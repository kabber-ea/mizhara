import { NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { getOrderById, updateOrderFulfillment } from "@/services/orders";
import type { DeliveryStatus, TrackingProvider } from "@/models/Order";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireAdmin();
  if (!isAdminSession(session)) return session;

  try {
    const { id } = await context.params;
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireAdmin();
  if (!isAdminSession(session)) return session;

  try {
    const { id } = await context.params;
    const body = await request.json();

    const order = await updateOrderFulfillment(id, {
      deliveryStatus: body.deliveryStatus as DeliveryStatus | undefined,
      trackingProvider: body.trackingProvider as TrackingProvider | undefined,
      trackingNumber: body.trackingNumber,
      trackingUrl: body.trackingUrl,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

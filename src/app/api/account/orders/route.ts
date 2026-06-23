import { NextResponse } from "next/server";
import { requireCustomer, isCustomerSession } from "@/lib/customer-auth";
import { listCustomerOrders } from "@/services/account";

export async function GET() {
  const session = await requireCustomer();
  if (!isCustomerSession(session)) return session;

  try {
    const orders = await listCustomerOrders(session.userId);
    return NextResponse.json({ items: orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

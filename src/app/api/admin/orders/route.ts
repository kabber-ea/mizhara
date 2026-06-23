import { NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { parsePagination } from "@/lib/pagination";
import { listOrders } from "@/services/orders";

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!isAdminSession(session)) return session;

  try {
    const { searchParams } = new URL(request.url);
    const pagination = parsePagination(searchParams);
    const data = await listOrders({
      ...pagination,
      deliveryStatus: searchParams.get("deliveryStatus") ?? "all",
      paymentStatus: searchParams.get("paymentStatus") ?? "all",
    });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

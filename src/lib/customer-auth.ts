import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import type { SessionPayload } from "@/lib/jwt";

export async function requireCustomer(): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session || session.role !== "customer") {
    return NextResponse.json({ error: "Please sign in to continue" }, { status: 401 });
  }
  return session;
}

export function isCustomerSession(result: SessionPayload | NextResponse): result is SessionPayload {
  return !(result instanceof NextResponse);
}

import { NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { getDashboardData } from "@/services/dashboard";

export async function GET() {
  const session = await requireAdmin();
  if (!isAdminSession(session)) return session;

  try {
    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load dashboard";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

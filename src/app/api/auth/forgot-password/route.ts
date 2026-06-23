import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/services/auth";

export async function POST(request: Request) {
  try {
    const { email, role = "customer" } = await request.json();

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (role !== "customer" && role !== "admin") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const response = await requestPasswordReset(email, role);
    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

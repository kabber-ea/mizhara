import { NextResponse } from "next/server";
import { registerUser } from "@/services/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    if (!name?.trim() || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Name and password (min 6 chars) are required" },
        { status: 400 }
      );
    }

    if (!email?.trim() && !phone?.trim()) {
      return NextResponse.json(
        { error: "Email or mobile number is required" },
        { status: 400 }
      );
    }

    await registerUser({ name, email, phone, password });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    const status =
      message === "Email already registered" || message === "Mobile number already registered"
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

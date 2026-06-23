import { NextResponse } from "next/server";
import { resetPassword } from "@/services/auth";

export async function POST(request: Request) {
  try {
    const { token, password, role = "customer" } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    if (role !== "customer" && role !== "admin") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await resetPassword(token, password, role);
    return NextResponse.json({ message: "Password reset successful. You can sign in now." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reset password";
    const status = message === "Invalid or expired reset link" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

import { NextResponse } from "next/server";
import { COOKIE_NAME, signToken } from "@/lib/jwt";
import { authenticate } from "@/services/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = body.identifier ?? body.email;
    const { password } = body;

    if (!identifier || !password) {
      return NextResponse.json({ error: "Email/phone and password are required" }, { status: 400 });
    }

    const session = await authenticate(identifier, password);
    if (!session) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signToken(session);
    const response = NextResponse.json({
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        phone: session.phone,
        role: session.role,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

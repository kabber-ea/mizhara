import { NextResponse } from "next/server";
import { COOKIE_NAME, signToken } from "@/lib/jwt";
import { requireCustomer, isCustomerSession } from "@/lib/customer-auth";
import { getCustomerProfile, updateCustomerProfile } from "@/services/account";

export async function GET() {
  const session = await requireCustomer();
  if (!isCustomerSession(session)) return session;

  try {
    const profile = await getCustomerProfile(session.userId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await requireCustomer();
  if (!isCustomerSession(session)) return session;

  try {
    const body = await request.json();
    const updated = await updateCustomerProfile(session.userId, {
      name: body.name,
      phone: body.phone,
      savedAddress: body.savedAddress,
    });

    if (!updated) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const token = await signToken(updated);
    const profile = await getCustomerProfile(session.userId);

    const response = NextResponse.json(profile);
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    const status = message === "Mobile number already in use" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

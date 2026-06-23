import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/jwt";

const GUEST_AUTH_PATHS = new Set([
  "/login",
  "/signup",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
]);

const CUSTOMER_AUTH_PATHS = new Set([
  "/login",
  "/signup",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

const ADMIN_AUTH_ENTRY_PATHS = new Set([
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
]);

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;
  const role = session?.role;

  if (role === "admin") {
    if (ADMIN_AUTH_ENTRY_PATHS.has(pathname)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (!isAdminPath(pathname)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (role === "customer") {
    if (isAdminPath(pathname)) {
      return NextResponse.redirect(new URL("/products", request.url));
    }
    if (CUSTOMER_AUTH_PATHS.has(pathname)) {
      return NextResponse.redirect(new URL("/products", request.url));
    }
    return NextResponse.next();
  }

  if (GUEST_AUTH_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (isAdminPath(pathname)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

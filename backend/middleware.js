// middleware.js
import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

// Routes that require authentication
const PROTECTED_ROUTES = ["/checkout", "/orders", "/order", "/profile"];
// Routes only for unauthenticated users (redirect if already logged in)
const AUTH_ROUTES = ["/auth/login", "/auth/register"];
// Routes that require admin role
const ADMIN_ROUTES = ["/admin"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  const user = token ? verifyToken(token) : null;

  // ── Redirect logged-in users away from auth pages ──────────────
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (user) {
      const redirect = request.nextUrl.searchParams.get("redirect") || "/menu";
      return NextResponse.redirect(new URL(redirect, request.url));
    }
    return NextResponse.next();
  }

  // ── Protect private routes ─────────────────────────────────────
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Protect admin routes ───────────────────────────────────────
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login?redirect=/admin", request.url));
    }
    if (user.role !== "admin") {
      // Non-admin trying to access admin area
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static files and internal Next.js routes
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|img/|fonts/).*)",
  ],
};

// lib/auth.js
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be defined and at least 32 characters long");
}

// ─── Token Creation ────────────────────────────────────────────────
export function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// ─── Token Verification ────────────────────────────────────────────
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// ─── Get current user from request (App Router) ───────────────────
export function getUserFromRequest(request) {
  const token =
    request.cookies.get("auth_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;
  return verifyToken(token);
}

// ─── Server Component: get user from cookies ──────────────────────
export function getUserFromCookies() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// ─── Set auth cookie ──────────────────────────────────────────────
export function setAuthCookie(response, token) {
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: "/",
  });
  return response;
}

// ─── Clear auth cookie ────────────────────────────────────────────
export function clearAuthCookie(response) {
  response.cookies.delete("auth_token");
  return response;
}

// ─── Route Protection HOC ─────────────────────────────────────────
export function withAuth(handler, { adminOnly = false } = {}) {
  return async function (request, context) {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    if (adminOnly && user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden. Admin access only." },
        { status: 403 }
      );
    }

    // Attach user to request for use in the handler
    request.user = user;
    return handler(request, context);
  };
}

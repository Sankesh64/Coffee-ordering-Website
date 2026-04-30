// app/api/auth/logout/route.js
import { clearAuthCookie } from "@/lib/auth";
import { apiSuccess } from "@/lib/apiResponse";
import { NextResponse } from "next/server";

export async function POST() {
  const response = apiSuccess({}, "Logged out successfully.");
  return clearAuthCookie(response);
}

// lib/apiResponse.js
import { NextResponse } from "next/server";

export const apiSuccess = (data = {}, message = "Success", status = 200) =>
  NextResponse.json({ success: true, message, ...data }, { status });

export const apiError = (message = "Something went wrong", status = 500) =>
  NextResponse.json({ success: false, message }, { status });

// Wraps an async route handler with try/catch to avoid unhandled rejections
export function withErrorHandler(handler) {
  return async function (request, context) {
    try {
      return await handler(request, context);
    } catch (err) {
      console.error(`[API Error] ${request.url}:`, err);

      // Mongoose validation error
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return apiError(messages.join(". "), 400);
      }

      // Mongoose duplicate key error
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return apiError(`${field} already exists.`, 409);
      }

      // JWT errors
      if (err.name === "JsonWebTokenError") {
        return apiError("Invalid token.", 401);
      }
      if (err.name === "TokenExpiredError") {
        return apiError("Token expired. Please login again.", 401);
      }

      return apiError("Internal server error.", 500);
    }
  };
}

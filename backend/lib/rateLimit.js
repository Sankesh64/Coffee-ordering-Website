// lib/rateLimit.js
import { apiError } from "./apiResponse";

// In-memory store — fine for single instance / dev.
// For production multi-instance deployments, use Redis (ioredis/upstash).
const store = new Map();

/**
 * @param {Request} request
 * @param {object} options
 * @param {number} options.limit - max requests per window
 * @param {number} options.windowMs - window in milliseconds
 * @returns {NextResponse|null} - returns error response if limited, null if ok
 */
export function rateLimit(request, { limit = 10, windowMs = 60_000 } = {}) {
  // Identify by IP (X-Forwarded-For in production, or direct IP)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const key = `${ip}:${request.nextUrl?.pathname || "global"}`;
  const now = Date.now();

  const record = store.get(key) || { count: 0, resetAt: now + windowMs };

  // Reset window if expired
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }

  record.count += 1;
  store.set(key, record);

  // Cleanup old keys every 1000 entries to prevent memory leak
  if (store.size > 1000) {
    for (const [k, v] of store.entries()) {
      if (now > v.resetAt) store.delete(k);
    }
  }

  if (record.count > limit) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return apiError(
      `Too many requests. Please try again in ${retryAfter} seconds.`,
      429
    );
  }

  return null; // Not rate limited
}

// app/api/contact/route.js
import { connectDB } from "@/lib/mongodb";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";
import { contactSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rateLimit";
import Contact from "@/models/Contact";

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export const POST = withErrorHandler(async (request) => {
  // Rate limit: 3 messages per 10 minutes per IP
  const limited = rateLimit(request, { limit: 3, windowMs: 10 * 60 * 1000 });
  if (limited) return limited;

  const body = await request.json();

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const messages = parsed.error.errors.map((e) => e.message).join(". ");
    return apiError(messages, 400);
  }

  await connectDB();

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  await Contact.create({ ...parsed.data, ipAddress: ip });

  // TODO: Send email notification to admin (use nodemailer)
  // sendAdminNotification(parsed.data);

  return apiSuccess(
    {},
    "Thank you for your message! We'll get back to you within 24 hours. ☕",
    201
  );
});

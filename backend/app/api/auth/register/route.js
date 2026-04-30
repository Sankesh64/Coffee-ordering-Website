// app/api/auth/register/route.js
import { connectDB } from "@/lib/mongodb";
import { createToken, setAuthCookie } from "@/lib/auth";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";
import { registerSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rateLimit";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const POST = withErrorHandler(async (request) => {
  // Rate limit: 5 registrations per hour per IP
  const limited = rateLimit(request, { limit: 5, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  const body = await request.json();

  // Validate input
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const messages = parsed.error.errors.map((e) => e.message).join(". ");
    return apiError(messages, 400);
  }

  const { name, email, password, phone } = parsed.data;

  await connectDB();

  // Check if email already registered
  const existingUser = await User.findOne({ email }).select("_id");
  if (existingUser) {
    // Don't reveal that the email exists (security best practice)
    // But for UX purposes in a coffee app, it's fine to tell the user
    return apiError("An account with this email already exists.", 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    phone: phone || undefined,
  });

  const token = createToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const response = apiSuccess(
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    "Account created successfully!",
    201
  );

  return setAuthCookie(response, token);
});

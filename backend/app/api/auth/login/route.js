// app/api/auth/login/route.js
import { connectDB } from "@/lib/mongodb";
import { createToken, setAuthCookie } from "@/lib/auth";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";
import { loginSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rateLimit";
import User from "@/models/User";

export const POST = withErrorHandler(async (request) => {
  // Rate limit: 10 attempts per 15 minutes per IP
  const limited = rateLimit(request, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;

  const body = await request.json();

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0].message, 400);
  }

  const { email, password } = parsed.data;

  await connectDB();

  // Fetch user WITH password field (select: false normally hides it)
  const user = await User.findOne({ email, isActive: true }).select("+password +loginAttempts +lockUntil");

  // Use a generic error message to prevent email enumeration
  const INVALID_CREDS = "Invalid email or password.";

  if (!user) {
    // Simulate bcrypt delay to prevent timing attacks that reveal email existence
    await new Promise((r) => setTimeout(r, 200));
    return apiError(INVALID_CREDS, 401);
  }

  // Check account lock
  if (user.isLocked) {
    const waitMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return apiError(
      `Account temporarily locked due to too many failed attempts. Try again in ${waitMinutes} minute(s).`,
      423
    );
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    await user.incrementLoginAttempts();
    return apiError(INVALID_CREDS, 401);
  }

  // Reset login attempts on success
  await User.findByIdAndUpdate(user._id, {
    $set: { loginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: 1 },
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
    "Login successful!"
  );

  return setAuthCookie(response, token);
});

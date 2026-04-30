// app/api/user/change-password/route.js
import { connectDB } from "@/lib/mongodb";
import { withAuth } from "@/lib/auth";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";
import { rateLimit } from "@/lib/rateLimit";
import { z } from "zod";
import User from "@/models/User";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export const POST = withAuth(
  withErrorHandler(async (request) => {
    // Rate limit password changes
    const limited = rateLimit(request, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (limited) return limited;

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, 400);
    }

    await connectDB();

    // Fetch user WITH password field
    const user = await User.findById(request.user.id).select("+password");
    if (!user) return apiError("User not found.", 404);

    // Verify current password
    const isMatch = await user.comparePassword(parsed.data.currentPassword);
    if (!isMatch) {
      return apiError("Current password is incorrect.", 401);
    }

    // Prevent reusing same password
    const isSame = await user.comparePassword(parsed.data.newPassword);
    if (isSame) {
      return apiError("New password must be different from your current password.", 400);
    }

    user.password = parsed.data.newPassword;
    await user.save(); // Pre-save hook will hash the new password

    return apiSuccess({}, "Password changed successfully. Please log in again on other devices.");
  })
);

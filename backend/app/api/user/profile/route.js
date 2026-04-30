// app/api/user/profile/route.js
import { connectDB } from "@/lib/mongodb";
import { withAuth } from "@/lib/auth";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";
import { z } from "zod";
import User from "@/models/User";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number").optional().or(z.literal("")),
});

export const PATCH = withAuth(
  withErrorHandler(async (request) => {
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, 400);
    }

    await connectDB();

    const update = { name: parsed.data.name };
    if (parsed.data.phone) update.phone = parsed.data.phone;

    const user = await User.findByIdAndUpdate(
      request.user.id,
      { $set: update },
      { new: true, runValidators: true }
    ).select("name email phone");

    if (!user) return apiError("User not found.", 404);

    return apiSuccess({ user }, "Profile updated successfully.");
  })
);

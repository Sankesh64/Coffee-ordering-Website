// app/api/auth/me/route.js
import { connectDB } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";
import User from "@/models/User";

export const GET = withErrorHandler(async (request) => {
  const userPayload = getUserFromRequest(request);
  if (!userPayload) return apiError("Unauthorized.", 401);

  await connectDB();
  const user = await User.findById(userPayload.id).select(
    "name email phone role savedAddresses createdAt"
  );

  if (!user || !user.isActive) return apiError("User not found.", 404);

  return apiSuccess({ user });
});

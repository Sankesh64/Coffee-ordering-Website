// app/api/admin/messages/route.js
import { connectDB } from "@/lib/mongodb";
import { withAuth } from "@/lib/auth";
import { apiSuccess, withErrorHandler } from "@/lib/apiResponse";
import Contact from "@/models/Contact";

export const GET = withAuth(
  withErrorHandler(async (request) => {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));

    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Contact.countDocuments(filter),
    ]);

    return apiSuccess({
      messages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }),
  { adminOnly: true }
);

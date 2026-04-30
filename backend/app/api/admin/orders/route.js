// app/api/admin/orders/route.js
import { connectDB } from "@/lib/mongodb";
import { withAuth } from "@/lib/auth";
import { apiSuccess, withErrorHandler } from "@/lib/apiResponse";
import Order from "@/models/Order";

export const GET = withAuth(
  withErrorHandler(async (request) => {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search"); // by orderNumber

    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) filter.orderNumber = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email phone"),
      Order.countDocuments(filter),
    ]);

    return apiSuccess({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }),
  { adminOnly: true }
);

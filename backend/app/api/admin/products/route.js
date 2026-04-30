// app/api/admin/products/route.js
import { connectDB } from "@/lib/mongodb";
import { withAuth } from "@/lib/auth";
import { apiSuccess, withErrorHandler } from "@/lib/apiResponse";
import Product from "@/models/Product";

// Admin-only: list ALL products including unavailable
export const GET = withAuth(
  withErrorHandler(async (request) => {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = Math.min(200, parseInt(searchParams.get("limit") || "100"));

    const filter = {};
    if (category) filter.category = category;
    // Admin sees ALL products (no isAvailable filter)

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("-reviews");

    return apiSuccess({ products });
  }),
  { adminOnly: true }
);

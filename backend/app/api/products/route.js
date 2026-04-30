// app/api/products/route.js
import { connectDB } from "@/lib/mongodb";
import { getUserFromRequest, withAuth } from "@/lib/auth";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";
import { productSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rateLimit";
import Product from "@/models/Product";

// ─── GET /api/products ─────────────────────────────────────────────
// Public: list products with filtering, sorting, search
export const GET = withErrorHandler(async (request) => {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "createdAt"; // price, name, rating, popular
  const order = searchParams.get("order") === "asc" ? 1 : -1;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
  const featured = searchParams.get("featured");

  // Build filter
  const filter = { isAvailable: true };
  if (category) filter.category = category;
  if (featured === "true") filter.isFeatured = true;

  // Full text search
  if (search) {
    filter.$text = { $search: search };
  }

  // Build sort
  const sortOptions = {};
  if (sort === "price") sortOptions.price = order;
  else if (sort === "name") sortOptions.name = order;
  else if (sort === "rating") sortOptions.averageRating = order;
  else if (sort === "popular") sortOptions.totalOrdered = -1;
  else sortOptions.createdAt = -1;

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select("-reviews"), // Don't load all reviews in list view
    Product.countDocuments(filter),
  ]);

  return apiSuccess({
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// ─── POST /api/products ────────────────────────────────────────────
// Admin only: create a product
export const POST = withAuth(
  withErrorHandler(async (request) => {
    const limited = rateLimit(request, { limit: 20, windowMs: 60_000 });
    if (limited) return limited;

    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(". ");
      return apiError(messages, 400);
    }

    await connectDB();
    const product = await Product.create(parsed.data);

    return apiSuccess({ product }, "Product created successfully.", 201);
  }),
  { adminOnly: true }
);

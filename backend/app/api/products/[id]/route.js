// app/api/products/[id]/route.js
import { connectDB } from "@/lib/mongodb";
import { withAuth } from "@/lib/auth";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";
import { productSchema, reviewSchema } from "@/lib/validations";
import Product from "@/models/Product";
import mongoose from "mongoose";

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ─── GET /api/products/:id ─────────────────────────────────────────
export const GET = withErrorHandler(async (request, { params }) => {
  if (!isValidId(params.id)) return apiError("Invalid product ID.", 400);

  await connectDB();

  const product = await Product.findOne({
    _id: params.id,
    isAvailable: true,
  });

  if (!product) return apiError("Product not found.", 404);

  return apiSuccess({ product });
});

// ─── PUT /api/products/:id ─────────────────────────────────────────
// Admin: update product
export const PUT = withAuth(
  withErrorHandler(async (request, { params }) => {
    if (!isValidId(params.id)) return apiError("Invalid product ID.", 400);

    const body = await request.json();
    const parsed = productSchema.partial().safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors.map((e) => e.message).join(". "), 400);
    }

    await connectDB();

    const product = await Product.findByIdAndUpdate(
      params.id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    );

    if (!product) return apiError("Product not found.", 404);

    return apiSuccess({ product }, "Product updated successfully.");
  }),
  { adminOnly: true }
);

// ─── DELETE /api/products/:id ──────────────────────────────────────
// Admin: soft delete (mark unavailable)
export const DELETE = withAuth(
  withErrorHandler(async (request, { params }) => {
    if (!isValidId(params.id)) return apiError("Invalid product ID.", 400);

    await connectDB();

    // Soft delete — keeps historical order data intact
    const product = await Product.findByIdAndUpdate(
      params.id,
      { isAvailable: false },
      { new: true }
    );

    if (!product) return apiError("Product not found.", 404);

    return apiSuccess({}, "Product removed from menu.");
  }),
  { adminOnly: true }
);

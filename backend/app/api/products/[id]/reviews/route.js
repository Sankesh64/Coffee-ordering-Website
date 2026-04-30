// app/api/products/[id]/reviews/route.js
import { connectDB } from "@/lib/mongodb";
import { withAuth, getUserFromRequest } from "@/lib/auth";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";
import { reviewSchema } from "@/lib/validations";
import Product from "@/models/Product";
import Order from "@/models/Order";
import mongoose from "mongoose";

// ─── POST /api/products/:id/reviews ───────────────────────────────
// Authenticated: add review (only if user has ordered it)
export const POST = withAuth(
  withErrorHandler(async (request, { params }) => {
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return apiError("Invalid product ID.", 400);
    }

    const user = request.user;
    const body = await request.json();

    const parsed = reviewSchema.safeParse({ ...body, productId: params.id });
    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, 400);
    }

    await connectDB();

    // Verify user has actually ordered this product
    const hasPurchased = await Order.findOne({
      userId: user.id,
      status: "delivered",
      "items.productId": params.id,
    });

    if (!hasPurchased) {
      return apiError(
        "You can only review products you have purchased and received.",
        403
      );
    }

    const product = await Product.findById(params.id);
    if (!product) return apiError("Product not found.", 404);

    // Prevent duplicate reviews
    const alreadyReviewed = product.reviews.some(
      (r) => r.userId.toString() === user.id
    );

    if (alreadyReviewed) {
      return apiError("You have already reviewed this product.", 409);
    }

    product.reviews.push({
      userId: user.id,
      userName: user.name,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });

    product.updateRatingStats();
    await product.save();

    return apiSuccess(
      {
        averageRating: product.averageRating,
        reviewCount: product.reviewCount,
      },
      "Review added successfully.",
      201
    );
  })
);

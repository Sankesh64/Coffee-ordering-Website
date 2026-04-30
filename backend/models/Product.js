// models/Product.js
import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Name too long"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [500, "Description too long"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      // Store in INR (since site is India-based via Razorpay)
    },
    category: {
      type: String,
      required: true,
      enum: [
        "hot-beverages",
        "cold-beverages",
        "refreshments",
        "special-combo",
        "desserts",
        "snacks",
      ],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    badge: {
      type: String,
      maxlength: 20,
      // e.g. "Popular", "Best Seller", "New", "Seasonal"
    },
    // Coffee-specific fields
    strength: { type: Number, min: 1, max: 5 },
    roast: {
      type: String,
      enum: ["Light", "Light-Medium", "Medium", "Medium-Dark", "Dark"],
    },
    origin: String,

    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    // Aggregated review stats (updated on each review save)
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    reviews: [ReviewSchema],

    // Track how many times ordered (for popularity sorting)
    totalOrdered: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ─── Indexes ───────────────────────────────────────────────────────
ProductSchema.index({ category: 1, isAvailable: 1 });
ProductSchema.index({ name: "text", description: "text" }); // Full-text search
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ totalOrdered: -1 }); // For popularity sorting

// ─── Update rating stats after each review ────────────────────────
ProductSchema.methods.updateRatingStats = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.reviewCount = 0;
    return;
  }
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  this.reviewCount = this.reviews.length;
  this.averageRating = Math.round((total / this.reviews.length) * 10) / 10;
};

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);

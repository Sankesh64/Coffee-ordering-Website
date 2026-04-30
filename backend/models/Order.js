// models/Order.js
import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },      // Snapshot at time of order
  price: { type: Number, required: true },      // Snapshot — price can change later
  image: { type: String },
  category: { type: String },
  quantity: { type: Number, required: true, min: 1, max: 20 },
  subtotal: { type: Number, required: true },   // price * quantity
});

const DeliveryAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "Order must have at least one item",
      },
    },

    // ─── Pricing Breakdown ───────────────────────────────────────
    subtotal: { type: Number, required: true },   // Sum of item subtotals
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },// Final amount charged

    deliveryAddress: { type: DeliveryAddressSchema, required: true },
    specialInstructions: { type: String, maxlength: 300 },

    // ─── Payment ─────────────────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    // Razorpay fields
    razorpayOrderId: String,    // From Razorpay order creation
    razorpayPaymentId: String,  // From Razorpay payment callback
    razorpaySignature: String,  // For audit trail

    // ─── Order Status ─────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "pending",       // Just created
        "confirmed",     // Payment received / COD confirmed
        "preparing",     // Being made
        "ready",         // Ready for delivery/pickup
        "out-for-delivery",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },

    // Status history for tracking
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],

    estimatedDeliveryTime: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ─── Indexes ───────────────────────────────────────────────────────
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ razorpayOrderId: 1 });
OrderSchema.index({ orderNumber: 1 });

// ─── Auto-generate order number ───────────────────────────────────
OrderSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  // Format: COFFEE-YYYYMMDD-XXXXX (e.g. COFFEE-20240101-00042)
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const count = await this.constructor.countDocuments();
  this.orderNumber = `COFFEE-${date}-${String(count + 1).padStart(5, "0")}`;
  
  // Add initial status to history
  this.statusHistory.push({ status: this.status, note: "Order created" });
  next();
});

// ─── Method: Update status with history ──────────────────────────
OrderSchema.methods.updateStatus = function (newStatus, note = "") {
  this.status = newStatus;
  this.statusHistory.push({ status: newStatus, timestamp: new Date(), note });

  if (newStatus === "delivered") this.deliveredAt = new Date();
  if (newStatus === "cancelled") this.cancelledAt = new Date();
};

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);

// app/api/orders/route.js
import { connectDB } from "@/lib/mongodb";
import { withAuth } from "@/lib/auth";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";
import { createOrderSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rateLimit";
import Order from "@/models/Order";
import Product from "@/models/Product";
import mongoose from "mongoose";

const DELIVERY_FEE = 40; // ₹40 delivery
const FREE_DELIVERY_THRESHOLD = 500; // Free delivery above ₹500
const GST_RATE = 0.05; // 5% GST

// ─── GET /api/orders ───────────────────────────────────────────────
// Authenticated: get user's order history
export const GET = withAuth(
  withErrorHandler(async (request) => {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(20, parseInt(searchParams.get("limit") || "10"));
    const status = searchParams.get("status");

    const filter = { userId: request.user.id };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-statusHistory"), // Lightweight list view
      Order.countDocuments(filter),
    ]);

    return apiSuccess({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  })
);

// ─── POST /api/orders ──────────────────────────────────────────────
// Authenticated: create a new order
export const POST = withAuth(
  withErrorHandler(async (request) => {
    // Rate limit: prevent spam ordering
    const limited = rateLimit(request, { limit: 5, windowMs: 60_000 });
    if (limited) return limited;

    const body = await request.json();

    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(". ");
      return apiError(messages, 400);
    }

    const { items, deliveryAddress, paymentMethod, specialInstructions } =
      parsed.data;

    await connectDB();

    // ── Verify all products exist and are available ────────────────
    const productIds = items.map((i) => i.productId);

    // Check all IDs are valid ObjectIds first
    if (productIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return apiError("One or more product IDs are invalid.", 400);
    }

    const products = await Product.find({
      _id: { $in: productIds },
      isAvailable: true,
    }).select("name price image category isAvailable");

    // Ensure every requested product was found
    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p._id.toString());
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      return apiError(
        `Some items are no longer available: ${missingIds.join(", ")}`,
        400
      );
    }

    // ── Build order items with server-side prices ──────────────────
    // CRITICAL: Never trust client-sent prices. Always use DB prices.
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);
      return {
        productId: product._id,
        name: product.name,
        price: product.price,           // Server-enforced price
        image: product.image,
        category: product.category,
        quantity: item.quantity,
        subtotal: product.price * item.quantity,
      };
    });

    // ── Calculate totals ───────────────────────────────────────────
    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const taxableAmount = subtotal + deliveryFee;
    const taxAmount = Math.round(taxableAmount * GST_RATE * 100) / 100;
    const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

    // ── Create order ───────────────────────────────────────────────
    const order = await Order.create({
      userId: request.user.id,
      items: orderItems,
      subtotal,
      deliveryFee,
      taxAmount,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      specialInstructions,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      status: "pending",
    });

    // ── For COD, immediately confirm ──────────────────────────────
    if (paymentMethod === "cod") {
      order.updateStatus("confirmed", "Cash on Delivery order confirmed");
      await order.save();
    }

    return apiSuccess(
      {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          taxAmount: order.taxAmount,
          status: order.status,
          paymentMethod: order.paymentMethod,
        },
      },
      "Order created successfully.",
      201
    );
  })
);

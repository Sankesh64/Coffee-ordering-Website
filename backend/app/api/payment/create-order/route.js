// app/api/payment/create-order/route.js
import { connectDB } from "@/lib/mongodb";
import { withAuth } from "@/lib/auth";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";
import { getRazorpay, toPaise } from "@/lib/razorpay";
import { rateLimit } from "@/lib/rateLimit";
import Order from "@/models/Order";
import mongoose from "mongoose";

/**
 * POST /api/payment/create-order
 *
 * Creates a Razorpay order for an existing Order document.
 * Flow:
 *   1. Frontend creates an Order via POST /api/orders
 *   2. Frontend calls this endpoint with the orderId
 *   3. This creates a Razorpay order and returns the razorpayOrderId
 *   4. Frontend opens the Razorpay checkout modal
 *   5. On payment, frontend calls POST /api/payment/verify
 */
export const POST = withAuth(
  withErrorHandler(async (request) => {
    const limited = rateLimit(request, { limit: 10, windowMs: 60_000 });
    if (limited) return limited;

    const body = await request.json();
    const { orderId } = body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return apiError("Valid orderId is required.", 400);
    }

    await connectDB();

    const order = await Order.findById(orderId);

    if (!order) return apiError("Order not found.", 404);

    // Security: user can only pay for their own order
    if (order.userId.toString() !== request.user.id) {
      return apiError("Forbidden.", 403);
    }

    // Prevent creating multiple payment orders for the same order
    if (order.razorpayOrderId) {
      // Return existing Razorpay order (idempotent)
      return apiSuccess({
        razorpayOrderId: order.razorpayOrderId,
        amount: toPaise(order.totalAmount),
        currency: "INR",
        orderId: order._id,
        orderNumber: order.orderNumber,
      });
    }

    if (order.paymentStatus === "paid") {
      return apiError("This order has already been paid.", 400);
    }

    if (order.status === "cancelled") {
      return apiError("Cannot pay for a cancelled order.", 400);
    }

    if (order.paymentMethod !== "razorpay") {
      return apiError("This order is set to Cash on Delivery.", 400);
    }

    const razorpay = getRazorpay();

    const razorpayOrder = await razorpay.orders.create({
      amount: toPaise(order.totalAmount),
      currency: "INR",
      receipt: order.orderNumber, // Our internal order number
      notes: {
        orderId: order._id.toString(),
        userId: request.user.id,
        customerName: request.user.name,
        customerEmail: request.user.email,
      },
    });

    // Save razorpayOrderId to our order
    await Order.findByIdAndUpdate(orderId, {
      razorpayOrderId: razorpayOrder.id,
    });

    return apiSuccess({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: order._id,
      orderNumber: order.orderNumber,
      // The key is public and goes to the client
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  })
);

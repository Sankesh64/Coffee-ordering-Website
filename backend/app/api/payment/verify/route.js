// app/api/payment/verify/route.js
import { connectDB } from "@/lib/mongodb";
import { withAuth } from "@/lib/auth";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { rateLimit } from "@/lib/rateLimit";
import Order from "@/models/Order";
import Product from "@/models/Product";

/**
 * POST /api/payment/verify
 *
 * Called by the frontend after Razorpay payment handler fires.
 * SECURITY: Verifies the HMAC-SHA256 signature before marking the order as paid.
 * This prevents an attacker from manually calling this endpoint to confirm
 * a payment they never actually made.
 */
export const POST = withAuth(
  withErrorHandler(async (request) => {
    const limited = rateLimit(request, { limit: 10, windowMs: 60_000 });
    if (limited) return limited;

    const body = await request.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = body;

    // Validate all required fields
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return apiError(
        "razorpayOrderId, razorpayPaymentId, razorpaySignature and orderId are all required.",
        400
      );
    }

    // ── CRITICAL: Verify signature ─────────────────────────────────
    let isValid;
    try {
      isValid = verifyPaymentSignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      });
    } catch (err) {
      // timingSafeEqual throws if buffers have different lengths (tampered data)
      return apiError("Payment verification failed. Invalid signature.", 400);
    }

    if (!isValid) {
      return apiError(
        "Payment verification failed. Signature mismatch. Please contact support.",
        400
      );
    }

    await connectDB();

    const order = await Order.findById(orderId);
    if (!order) return apiError("Order not found.", 404);

    // Security: ensure the user owns this order
    if (order.userId.toString() !== request.user.id) {
      return apiError("Forbidden.", 403);
    }

    // Idempotency: if already paid, just return success
    if (order.paymentStatus === "paid") {
      return apiSuccess(
        { order: { _id: order._id, orderNumber: order.orderNumber, status: order.status } },
        "Payment already confirmed."
      );
    }

    // Validate that the razorpayOrderId matches what we stored
    if (order.razorpayOrderId !== razorpayOrderId) {
      return apiError("Order ID mismatch. Possible tampering detected.", 400);
    }

    // ── Update order as paid ───────────────────────────────────────
    order.paymentStatus = "paid";
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature; // Store for audit
    order.updateStatus("confirmed", "Payment received via Razorpay");

    // Set estimated delivery time (30-60 min from now)
    order.estimatedDeliveryTime = new Date(Date.now() + 45 * 60 * 1000);

    await order.save();

    // ── Update product popularity counters (fire and forget) ───────
    const itemUpdates = order.items.map((item) =>
      Product.findByIdAndUpdate(item.productId, {
        $inc: { totalOrdered: item.quantity },
      })
    );
    Promise.all(itemUpdates).catch(console.error); // Non-blocking

    return apiSuccess(
      {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          estimatedDeliveryTime: order.estimatedDeliveryTime,
        },
      },
      "Payment verified successfully! Your order is confirmed. ☕"
    );
  })
);

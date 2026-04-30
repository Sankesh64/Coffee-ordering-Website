// app/api/orders/[id]/route.js
import { connectDB } from "@/lib/mongodb";
import { withAuth } from "@/lib/auth";
import { apiSuccess, apiError, withErrorHandler } from "@/lib/apiResponse";
import Order from "@/models/Order";
import mongoose from "mongoose";

// ─── GET /api/orders/:id ───────────────────────────────────────────
export const GET = withAuth(
  withErrorHandler(async (request, { params }) => {
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return apiError("Invalid order ID.", 400);
    }

    await connectDB();

    const order = await Order.findById(params.id).populate(
      "items.productId",
      "name image"
    );

    if (!order) return apiError("Order not found.", 404);

    // Users can only view their own orders; admins can view all
    if (
      request.user.role !== "admin" &&
      order.userId.toString() !== request.user.id
    ) {
      return apiError("Forbidden.", 403);
    }

    return apiSuccess({ order });
  })
);

// ─── PATCH /api/orders/:id ─────────────────────────────────────────
// User: cancel order (only if pending or confirmed)
// Admin: update status to any value
export const PATCH = withAuth(
  withErrorHandler(async (request, { params }) => {
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return apiError("Invalid order ID.", 400);
    }

    const body = await request.json();
    const { action, status, note, cancellationReason } = body;

    await connectDB();

    const order = await Order.findById(params.id);
    if (!order) return apiError("Order not found.", 404);

    const isAdmin = request.user.role === "admin";
    const isOwner = order.userId.toString() === request.user.id;

    if (!isAdmin && !isOwner) {
      return apiError("Forbidden.", 403);
    }

    // ── User cancellation ─────────────────────────────────────────
    if (action === "cancel") {
      if (!isOwner && !isAdmin) {
        return apiError("Only the order owner can cancel.", 403);
      }

      const cancellableStatuses = ["pending", "confirmed"];
      if (!cancellableStatuses.includes(order.status)) {
        return apiError(
          `Cannot cancel an order that is "${order.status}". Contact support.`,
          400
        );
      }

      order.updateStatus("cancelled", cancellationReason || "Cancelled by user");
      order.cancellationReason = cancellationReason || "Cancelled by user";

      // If already paid, mark for refund
      if (order.paymentStatus === "paid") {
        order.paymentStatus = "refunded";
        order.updateStatus("refunded", "Refund initiated");
      }

      await order.save();
      return apiSuccess({ order }, "Order cancelled successfully.");
    }

    // ── Admin status update ────────────────────────────────────────
    if (isAdmin && status) {
      const validStatuses = [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "out-for-delivery",
        "delivered",
        "cancelled",
        "refunded",
      ];

      if (!validStatuses.includes(status)) {
        return apiError(`Invalid status: ${status}`, 400);
      }

      order.updateStatus(status, note || `Status updated by admin`);
      await order.save();

      return apiSuccess({ order }, `Order status updated to "${status}".`);
    }

    return apiError("Invalid action.", 400);
  })
);

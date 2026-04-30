// app/api/payment/webhook/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

/**
 * POST /api/payment/webhook
 *
 * Razorpay sends server-to-server notifications here for:
 * - payment.captured (payment successful)
 * - payment.failed
 * - refund.created
 *
 * This is a BACKUP to the client-side verify flow.
 * Configure this URL in your Razorpay Dashboard → Webhooks.
 *
 * IMPORTANT: Webhooks must verify the signature using the
 * webhook secret (different from the API key secret).
 */
export async function POST(request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET not set — webhook disabled");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // Read raw body for signature verification
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // ── Verify webhook signature ──────────────────────────────────────
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const isValid = crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "utf8"),
    Buffer.from(signature, "utf8")
  );

  if (!isValid) {
    console.error("Razorpay webhook: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  await connectDB();

  const { event: eventType, payload } = event;

  try {
    switch (eventType) {
      case "payment.captured": {
        const payment = payload?.payment?.entity;
        if (!payment) break;

        const order = await Order.findOne({ razorpayOrderId: payment.order_id });
        if (!order) {
          console.warn(`Webhook payment.captured: no order for razorpay order ${payment.order_id}`);
          break;
        }

        if (order.paymentStatus !== "paid") {
          order.paymentStatus = "paid";
          order.razorpayPaymentId = payment.id;
          order.updateStatus("confirmed", "Payment confirmed via webhook");
          order.estimatedDeliveryTime = new Date(Date.now() + 45 * 60 * 1000);
          await order.save();

          // Update product popularity counters
          const updates = order.items.map((item) =>
            Product.findByIdAndUpdate(item.productId, { $inc: { totalOrdered: item.quantity } })
          );
          await Promise.all(updates);

          console.log(`Webhook: Order ${order.orderNumber} confirmed via payment.captured`);
        }
        break;
      }

      case "payment.failed": {
        const payment = payload?.payment?.entity;
        if (!payment) break;

        const order = await Order.findOne({ razorpayOrderId: payment.order_id });
        if (order && order.paymentStatus === "pending") {
          order.paymentStatus = "failed";
          order.updateStatus("cancelled", `Payment failed: ${payment.error_description || "Unknown error"}`);
          await order.save();
          console.log(`Webhook: Order ${order.orderNumber} payment failed`);
        }
        break;
      }

      case "refund.created": {
        const refund = payload?.refund?.entity;
        if (!refund) break;

        // Find order by razorpay payment ID
        const order = await Order.findOne({ razorpayPaymentId: refund.payment_id });
        if (order) {
          order.paymentStatus = "refunded";
          order.updateStatus("refunded", `Refund of ₹${refund.amount / 100} initiated`);
          await order.save();
          console.log(`Webhook: Refund created for order ${order.orderNumber}`);
        }
        break;
      }

      default:
        console.log(`Webhook: unhandled event type "${eventType}"`);
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    // Still return 200 to prevent Razorpay from retrying
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true }, { status: 200 });
}

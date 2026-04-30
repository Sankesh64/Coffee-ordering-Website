// lib/razorpay.js
import Razorpay from "razorpay";
import crypto from "crypto";

let razorpayInstance = null;

export function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay credentials missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local"
    );
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpayInstance;
}

/**
 * Verifies the Razorpay payment signature.
 * This is CRITICAL — without this, an attacker could fake a payment.
 */
export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "utf8"),
    Buffer.from(signature, "utf8")
  );
}

/**
 * Convert amount to paise (Razorpay uses smallest currency unit)
 */
export function toPaise(amountInRupees) {
  return Math.round(amountInRupees * 100);
}

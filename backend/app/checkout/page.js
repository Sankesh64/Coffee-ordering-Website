"use client";
// app/checkout/page.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 500;
const GST_RATE = 0.05;

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir",
  "Ladakh","Puducherry","Chandigarh","Dadra and Nagar Haveli","Daman and Diu",
  "Lakshadweep","Andaman and Nicobar Islands",
];

export default function CheckoutPage() {
  const { items, subtotal, clearCart, hydrated } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if not logged in
  useEffect(() => {
    if (!user && hydrated) {
      router.push("/auth/login?redirect=/checkout");
    }
  }, [user, hydrated, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.push("/cart");
    }
  }, [items, hydrated, router]);

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const taxAmount = Math.round((subtotal + deliveryFee) * GST_RATE * 100) / 100;
  const total = subtotal + deliveryFee + taxAmount;

  function validateAddress() {
    const errs = {};
    if (!address.fullName.trim()) errs.fullName = "Full name is required";
    if (!/^[6-9]\d{9}$/.test(address.phone)) errs.phone = "Valid 10-digit phone number required";
    if (!address.addressLine1.trim()) errs.addressLine1 = "Address is required";
    if (!address.city.trim()) errs.city = "City is required";
    if (!address.state) errs.state = "State is required";
    if (!/^\d{6}$/.test(address.pincode)) errs.pincode = "Valid 6-digit pincode required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function placeOrder() {
    if (!validateAddress()) return;

    setLoading(true);
    try {
      // Step 1: Create the order in our database
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          deliveryAddress: address,
          paymentMethod,
          specialInstructions,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || "Failed to create order");

      const { order } = orderData;

      // Step 2a: COD — go straight to confirmation
      if (paymentMethod === "cod") {
        clearCart();
        router.push(`/order/${order._id}?success=true`);
        return;
      }

      // Step 2b: Razorpay — create a payment order
      const payRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order._id }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.message || "Failed to initiate payment");

      // Step 3: Open Razorpay checkout
      await openRazorpay({
        razorpayOrderId: payData.razorpayOrderId,
        amount: payData.amount,
        currency: payData.currency,
        orderId: order._id,
        orderNumber: order.orderNumber,
        user,
        onSuccess: async ({ razorpay_payment_id, razorpay_order_id, razorpay_signature }) => {
          // Step 4: Verify payment on server
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: razorpay_order_id,
              razorpayPaymentId: razorpay_payment_id,
              razorpaySignature: razorpay_signature,
              orderId: order._id,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(verifyData.message || "Payment verification failed");

          clearCart();
          router.push(`/order/${order._id}?success=true`);
        },
        onFailure: (err) => {
          console.error("Payment failed:", err);
          router.push(`/order/${order._id}?failed=true`);
        },
      });
    } catch (err) {
      alert(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!hydrated) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return null;

  return (
    <div className="checkout-page">
      <div className="section-content">
        <h1 style={{ fontSize: "2rem", color: "var(--primary-color)", marginBottom: 32 }}>
          Checkout
        </h1>

        <div className="checkout-layout">
          {/* Left: Delivery + Payment */}
          <div>
            {/* Delivery Address */}
            <div
              style={{ background: "white", borderRadius: 8, padding: 24, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 20 }}>
                📍 Delivery Address
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Full Name *</label>
                  <input
                    className={`form-input ${errors.fullName ? "error" : ""}`}
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    placeholder="Full name"
                  />
                  {errors.fullName && <p className="field-error">{errors.fullName}</p>}
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    className={`form-input ${errors.phone ? "error" : ""}`}
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    placeholder="10-digit mobile"
                    maxLength={10}
                  />
                  {errors.phone && <p className="field-error">{errors.phone}</p>}
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Address Line 1 *</label>
                  <input
                    className={`form-input ${errors.addressLine1 ? "error" : ""}`}
                    value={address.addressLine1}
                    onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                    placeholder="House no, Street, Area"
                  />
                  {errors.addressLine1 && <p className="field-error">{errors.addressLine1}</p>}
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Address Line 2</label>
                  <input
                    className="form-input"
                    value={address.addressLine2}
                    onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                    placeholder="Landmark (optional)"
                  />
                </div>

                <div className="form-group">
                  <label>City *</label>
                  <input
                    className={`form-input ${errors.city ? "error" : ""}`}
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="City"
                  />
                  {errors.city && <p className="field-error">{errors.city}</p>}
                </div>

                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    className={`form-input ${errors.pincode ? "error" : ""}`}
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "") })}
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                  {errors.pincode && <p className="field-error">{errors.pincode}</p>}
                </div>

                <div className="form-group">
                  <label>State *</label>
                  <select
                    className={`form-input ${errors.state ? "error" : ""}`}
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  >
                    {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div
              style={{ background: "white", borderRadius: 8, padding: 24, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
                📝 Special Instructions
              </h2>
              <textarea
                className="form-input"
                rows={3}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value.slice(0, 300))}
                placeholder="Any dietary preferences, allergies, or delivery notes..."
              />
              <p style={{ fontSize: "0.75rem", color: "#888", marginTop: 4 }}>
                {specialInstructions.length}/300
              </p>
            </div>

            {/* Payment Method */}
            <div
              style={{ background: "white", borderRadius: 8, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
                💳 Payment Method
              </h2>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <PaymentOption
                  value="razorpay"
                  selected={paymentMethod}
                  onSelect={setPaymentMethod}
                  label="💳 Pay Online"
                  description="UPI, Cards, Net Banking"
                />
                <PaymentOption
                  value="cod"
                  selected={paymentMethod}
                  onSelect={setPaymentMethod}
                  label="💵 Cash on Delivery"
                  description="Pay when delivered"
                />
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="order-summary">
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 20 }}>
                Order Summary
              </h2>

              {items.map((item) => (
                <div key={item.productId} className="summary-row" style={{ fontSize: "0.85rem" }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              <div className="summary-row" style={{ marginTop: 12 }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span style={{ color: "var(--success-color)" }}>FREE</span>
                  ) : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="summary-row">
                <span>GST (5%)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <button
                onClick={placeOrder}
                disabled={loading}
                className="submit-btn"
                style={{ marginTop: 24, borderRadius: 30 }}
              >
                {loading
                  ? "Processing..."
                  : paymentMethod === "cod"
                  ? "Place Order (COD)"
                  : `Pay ₹${total.toFixed(2)}`}
              </button>

              <Link
                href="/cart"
                style={{ display: "block", textAlign: "center", marginTop: 12, color: "#888", fontSize: "0.85rem" }}
              >
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({ value, selected, onSelect, label, description }) {
  const isSelected = selected === value;
  return (
    <button
      onClick={() => onSelect(value)}
      style={{
        flex: 1,
        padding: "16px",
        border: `2px solid ${isSelected ? "var(--secondary-color)" : "var(--medium-gray-color)"}`,
        borderRadius: 8,
        background: isSelected ? "#fff8f0" : "white",
        cursor: "pointer",
        textAlign: "left",
        minWidth: 140,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "0.8rem", color: "#888" }}>{description}</div>
    </button>
  );
}

// ── Razorpay Checkout Handler ──────────────────────────────────────
function openRazorpay({ razorpayOrderId, amount, currency, orderId, orderNumber, user, onSuccess, onFailure }) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "☕ Coffee",
        description: `Order ${orderNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: "#3b141c" },
        handler: async (response) => {
          try {
            await onSuccess(response);
            resolve();
          } catch (err) {
            onFailure(err);
            reject(err);
          }
        },
        modal: {
          ondismiss: () => {
            onFailure(new Error("Payment cancelled"));
            resolve(); // Not a hard error — user dismissed
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        onFailure(response.error);
        resolve();
      });
      rzp.open();
    };

    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}

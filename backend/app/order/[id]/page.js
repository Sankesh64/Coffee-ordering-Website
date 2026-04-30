"use client";
// app/order/[id]/page.js
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: "📋" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { key: "ready", label: "Ready", icon: "📦" },
  { key: "out-for-delivery", label: "Out for Delivery", icon: "🛵" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
];

const STATUS_INDEX = Object.fromEntries(STATUS_STEPS.map((s, i) => [s.key, i]));

export default function OrderDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";
  const isFailed = searchParams.get("failed") === "true";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder();
    // Poll every 30s for live status updates
    const interval = setInterval(fetchOrder, 30_000);
    return () => clearInterval(interval);
  }, [id]);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrder(data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function cancelOrder() {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", cancellationReason: "Cancelled by customer" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrder(data.order);
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (error) return (
    <div style={{ padding: "120px 20px", textAlign: "center" }}>
      <p style={{ color: "var(--error-color)", marginBottom: 16 }}>{error}</p>
      <Link href="/orders" className="button">My Orders</Link>
    </div>
  );

  const currentStep = STATUS_INDEX[order.status] ?? 0;
  const isCancelled = order.status === "cancelled" || order.status === "refunded";
  const canCancel = ["pending", "confirmed"].includes(order.status);

  return (
    <div style={{ minHeight: "100vh", background: "var(--light-pink-color)", padding: "100px 20px 60px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* Success / Failed Banner */}
        {isSuccess && (
          <div className="alert alert-success" style={{ marginBottom: 24, textAlign: "center", fontSize: "1.05rem" }}>
            🎉 <strong>Order placed successfully!</strong> Your coffee is on the way!
          </div>
        )}
        {isFailed && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            ⚠️ Payment failed or was cancelled. Your order is still saved — you can retry payment below.
          </div>
        )}

        {/* Order Header */}
        <div style={{ background: "white", borderRadius: 8, padding: 24, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: "1.4rem", color: "var(--primary-color)", marginBottom: 4 }}>
                Order #{order.orderNumber}
              </h1>
              <p style={{ color: "#888", fontSize: "0.85rem" }}>
                Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <StatusBadge status={order.status} />
              <PaymentBadge status={order.paymentStatus} />
            </div>
          </div>

          {order.estimatedDeliveryTime && !isCancelled && order.status !== "delivered" && (
            <p style={{ marginTop: 12, color: "#555", fontSize: "0.9rem" }}>
              ⏱ Estimated delivery: <strong>{new Date(order.estimatedDeliveryTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</strong>
            </p>
          )}
        </div>

        {/* Order Tracker */}
        {!isCancelled && (
          <div style={{ background: "white", borderRadius: 8, padding: 24, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 24 }}>Order Tracking</h2>
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
              {/* Progress line */}
              <div style={{
                position: "absolute", top: 18, left: "5%", right: "5%", height: 3,
                background: "var(--medium-gray-color)", zIndex: 0,
              }} />
              <div style={{
                position: "absolute", top: 18, left: "5%",
                width: `${(currentStep / (STATUS_STEPS.length - 1)) * 90}%`,
                height: 3, background: "var(--secondary-color)", zIndex: 1,
                transition: "width 0.5s ease",
              }} />

              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStep;
                return (
                  <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, flex: 1 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: done ? "var(--secondary-color)" : "white",
                      border: `3px solid ${done ? "var(--secondary-color)" : "var(--medium-gray-color)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1rem", transition: "all 0.3s",
                    }}>
                      {step.icon}
                    </div>
                    <p style={{ fontSize: "0.65rem", marginTop: 6, textAlign: "center", color: done ? "var(--primary-color)" : "#aaa", fontWeight: done ? 600 : 400 }}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div style={{ background: "white", borderRadius: 8, padding: 24, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>Items Ordered</h2>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {item.image && (
                  <img src={item.image} alt={item.name} style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover" }}
                    onError={(e) => { e.target.style.display = "none"; }} />
                )}
                <div>
                  <p style={{ fontWeight: 600 }}>{item.name}</p>
                  <p style={{ fontSize: "0.8rem", color: "#888" }}>₹{item.price.toFixed(2)} × {item.quantity}</p>
                </div>
              </div>
              <p style={{ fontWeight: 600 }}>₹{item.subtotal.toFixed(2)}</p>
            </div>
          ))}

          {/* Totals */}
          <div style={{ marginTop: 16 }}>
            <SummaryRow label="Subtotal" value={`₹${order.subtotal.toFixed(2)}`} />
            <SummaryRow label="Delivery" value={order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee.toFixed(2)}`} />
            <SummaryRow label="GST (5%)" value={`₹${order.taxAmount.toFixed(2)}`} />
            <SummaryRow label="Total" value={`₹${order.totalAmount.toFixed(2)}`} bold />
          </div>
        </div>

        {/* Delivery Address */}
        <div style={{ background: "white", borderRadius: 8, padding: 24, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12 }}>📍 Delivery Address</h2>
          <p style={{ fontWeight: 600 }}>{order.deliveryAddress.fullName}</p>
          <p style={{ color: "#555", lineHeight: 1.7 }}>
            {order.deliveryAddress.addressLine1}
            {order.deliveryAddress.addressLine2 && `, ${order.deliveryAddress.addressLine2}`}<br />
            {order.deliveryAddress.city}, {order.deliveryAddress.state} — {order.deliveryAddress.pincode}<br />
            📞 {order.deliveryAddress.phone}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/menu" className="button">Order Again ☕</Link>
          <Link href="/orders" style={{ padding: "10px 28px", borderRadius: 30, border: "1.5px solid var(--primary-color)", color: "var(--primary-color)", textDecoration: "none", fontWeight: 500 }}>
            All Orders
          </Link>
          {canCancel && (
            <button
              onClick={cancelOrder}
              disabled={cancelling}
              style={{ padding: "10px 28px", borderRadius: 30, border: "1.5px solid var(--error-color)", color: "var(--error-color)", background: "none", cursor: "pointer", fontWeight: 500 }}
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending: "#f3961c", confirmed: "#3182ce", preparing: "#805ad5",
    ready: "#38a169", "out-for-delivery": "#dd6b20", delivered: "#276749",
    cancelled: "#e53e3e", refunded: "#718096",
  };
  return (
    <span style={{ background: colors[status] || "#ccc", color: "white", padding: "4px 12px", borderRadius: 20, fontSize: "0.8rem", fontWeight: 600, display: "inline-block", textTransform: "capitalize" }}>
      {status.replace(/-/g, " ")}
    </span>
  );
}

function PaymentBadge({ status }) {
  const colors = { pending: "#f3961c", paid: "#38a169", failed: "#e53e3e", refunded: "#718096" };
  return (
    <span style={{ background: colors[status] || "#ccc", color: "white", padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, display: "inline-block", marginTop: 6, textTransform: "capitalize" }}>
      {status}
    </span>
  );
}

function SummaryRow({ label, value, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontWeight: bold ? 700 : 400, fontSize: bold ? "1rem" : "0.9rem", borderTop: bold ? "2px solid #eee" : "none", marginTop: bold ? 8 : 0 }}>
      <span>{label}</span>
      <span style={{ color: bold ? "var(--primary-color)" : "inherit" }}>{value}</span>
    </div>
  );
}

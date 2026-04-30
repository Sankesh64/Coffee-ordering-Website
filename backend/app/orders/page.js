"use client";
// app/orders/page.js
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

const STATUS_COLORS = {
  pending: "#f3961c", confirmed: "#3182ce", preparing: "#805ad5",
  ready: "#38a169", "out-for-delivery": "#dd6b20", delivered: "#276749",
  cancelled: "#e53e3e", refunded: "#718096",
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login?redirect=/orders");
  }, [user, authLoading]);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user, page, statusFilter]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--light-pink-color)", padding: "100px 20px 60px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <h1 style={{ fontSize: "2rem", color: "var(--primary-color)" }}>My Orders</h1>
          <Link href="/menu" className="button">+ New Order</Link>
        </div>

        {/* Filter */}
        <div style={{ marginBottom: 24 }}>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="form-input"
            style={{ maxWidth: 220 }}
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="out-for-delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">☕</div>
            <p>No orders found.</p>
            <Link href="/menu" className="button" style={{ marginTop: 20, display: "inline-block" }}>Browse Menu</Link>
          </div>
        ) : (
          <>
            {orders.map((order) => (
              <Link key={order._id} href={`/order/${order._id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "white", borderRadius: 8, padding: 20, marginBottom: 16,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "box-shadow 0.2s",
                  cursor: "pointer",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <p style={{ fontWeight: 700, color: "var(--primary-color)", marginBottom: 2 }}>
                        #{order.orderNumber}
                      </p>
                      <p style={{ fontSize: "0.8rem", color: "#888" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        {" · "}{order.items?.length || 0} item(s)
                        {" · "}{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 6 }}>
                        ₹{order.totalAmount?.toFixed(2)}
                      </p>
                      <span style={{
                        background: STATUS_COLORS[order.status] || "#ccc",
                        color: "white", padding: "3px 10px", borderRadius: 20,
                        fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize",
                      }}>
                        {order.status?.replace(/-/g, " ")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="qty-btn"
                  style={{ width: "auto", padding: "8px 20px", borderRadius: 20, height: "auto" }}
                >
                  ← Prev
                </button>
                <span style={{ padding: "8px 16px", color: "#555" }}>
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="qty-btn"
                  style={{ width: "auto", padding: "8px 20px", borderRadius: 20, height: "auto" }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

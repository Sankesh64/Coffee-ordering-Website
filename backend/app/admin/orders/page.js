"use client";
// app/admin/orders/page.js
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  "pending","confirmed","preparing","ready","out-for-delivery","delivered","cancelled","refunded"
];

const STATUS_COLORS = {
  pending: "#f3961c", confirmed: "#3182ce", preparing: "#805ad5",
  ready: "#38a169", "out-for-delivery": "#dd6b20", delivered: "#276749",
  cancelled: "#e53e3e", refunded: "#718096",
};

export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null); // orderId being updated

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) router.push("/");
  }, [user, authLoading]);

  useEffect(() => {
    if (user?.role === "admin") fetchOrders();
  }, [user, page, statusFilter]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { if (user?.role === "admin") fetchOrders(); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (res.ok) { setOrders(data.orders); setPagination(data.pagination); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function updateStatus(orderId, newStatus) {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) { alert(err.message); }
    finally { setUpdating(null); }
  }

  if (authLoading || (!user && !authLoading)) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f7f7f7", padding: "80px 20px 60px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <Link href="/admin" style={{ color: "#888", fontSize: "0.85rem", textDecoration: "none" }}>← Dashboard</Link>
            <h1 style={{ fontSize: "1.8rem", color: "var(--primary-color)", marginTop: 4 }}>Manage Orders</h1>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <input
            className="form-input"
            style={{ maxWidth: 280 }}
            placeholder="Search by order number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="form-input"
            style={{ maxWidth: 200 }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state"><div className="emoji">📦</div><p>No orders found.</p></div>
        ) : (
          <div style={{ background: "white", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--primary-color)", color: "white" }}>
                    {["Order #", "Customer", "Items", "Total", "Payment", "Status", "Date", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr key={order._id} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                      <td style={td}>
                        <Link href={`/order/${order._id}`} style={{ color: "var(--secondary-color)", fontWeight: 600, textDecoration: "none" }}>
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td style={td}>
                        <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>{order.userId?.name || "—"}</p>
                        <p style={{ fontSize: "0.75rem", color: "#888" }}>{order.userId?.email}</p>
                      </td>
                      <td style={td}>{order.items?.length} item(s)</td>
                      <td style={{ ...td, fontWeight: 700 }}>₹{order.totalAmount?.toFixed(2)}</td>
                      <td style={td}>
                        <span style={{ fontSize: "0.8rem", padding: "2px 8px", borderRadius: 12, background: order.paymentStatus === "paid" ? "#c6f6d5" : "#fed7d7", color: order.paymentStatus === "paid" ? "#276749" : "#c53030" }}>
                          {order.paymentMethod === "cod" ? "COD" : order.paymentStatus}
                        </span>
                      </td>
                      <td style={td}>
                        <select
                          value={order.status}
                          disabled={updating === order._id}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          style={{
                            padding: "4px 8px", borderRadius: 6, border: `1.5px solid ${STATUS_COLORS[order.status] || "#ccc"}`,
                            background: "white", fontSize: "0.8rem", cursor: "pointer", color: STATUS_COLORS[order.status],
                            fontWeight: 600, outline: "none",
                          }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ ...td, fontSize: "0.8rem", color: "#888", whiteSpace: "nowrap" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </td>
                      <td style={td}>
                        <Link href={`/order/${order._id}`} style={{ fontSize: "0.8rem", color: "var(--secondary-color)", fontWeight: 600 }}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 24 }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="qty-btn" style={{ width: "auto", height: "auto", padding: "8px 20px", borderRadius: 20 }}>← Prev</button>
            <span style={{ color: "#555" }}>Page {page} of {pagination.pages} ({pagination.total} total)</span>
            <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="qty-btn" style={{ width: "auto", height: "auto", padding: "8px 20px", borderRadius: 20 }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

const td = { padding: "12px 16px", fontSize: "0.875rem", verticalAlign: "middle" };

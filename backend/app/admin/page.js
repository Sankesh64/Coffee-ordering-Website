"use client";
// app/admin/page.js
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "admin") {
        router.push("/");
      } else {
        fetchStats();
      }
    }
  }, [user, authLoading]);

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user || user.role !== "admin") return null;

  const { stats: s, recentOrders, topProducts } = stats || {};

  return (
    <div style={{ minHeight: "100vh", background: "#f7f7f7", padding: "80px 20px 60px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", color: "var(--primary-color)", marginBottom: 32 }}>
          Admin Dashboard ☕
        </h1>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20, marginBottom: 40 }}>
          <StatCard label="Total Orders" value={s?.orders.total} icon="📦" color="#3b141c" />
          <StatCard label="Today's Orders" value={s?.orders.today} icon="🌅" color="#f3961c" />
          <StatCard label="Pending" value={s?.orders.pending} icon="⏳" color="#805ad5" />
          <StatCard label="Total Revenue" value={`₹${(s?.revenue.total || 0).toFixed(0)}`} icon="💰" color="#38a169" />
          <StatCard label="This Month" value={`₹${(s?.revenue.thisMonth || 0).toFixed(0)}`} icon="📈" color="#3182ce" />
          <StatCard label="Products" value={s?.products.available} icon="☕" color="#dd6b20" />
          <StatCard label="Total Users" value={s?.users.total} icon="👤" color="#e53e3e" />
          <StatCard label="New Messages" value={s?.messages.unread} icon="✉️" color="#718096" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Recent Orders */}
          <div style={{ background: "white", borderRadius: 8, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700 }}>Recent Orders</h2>
              <Link href="/admin/orders" style={{ color: "var(--secondary-color)", fontSize: "0.85rem" }}>View all →</Link>
            </div>
            {recentOrders?.map((order) => (
              <Link key={order._id} href={`/order/${order._id}`} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--dark-color)" }}>#{order.orderNumber}</p>
                    <p style={{ fontSize: "0.75rem", color: "#888" }}>
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>₹{order.totalAmount?.toFixed(0)}</p>
                    <StatusPill status={order.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Top Products */}
          <div style={{ background: "white", borderRadius: 8, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700 }}>Top Products</h2>
              <Link href="/admin/products" style={{ color: "var(--secondary-color)", fontSize: "0.85rem" }}>Manage →</Link>
            </div>
            {topProducts?.map((p, i) => (
              <div key={p._id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "#ccc", fontSize: "1.2rem" }}>#{i + 1}</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{p.name}</p>
                    <p style={{ fontSize: "0.75rem", color: "#888" }}>₹{p.price}</p>
                  </div>
                </div>
                <p style={{ fontWeight: 600, color: "var(--secondary-color)" }}>{p.totalOrdered} sold</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: 16, marginTop: 32, flexWrap: "wrap" }}>
          <Link href="/admin/orders" className="button">Manage Orders</Link>
          <Link href="/admin/products" className="button" style={{ background: "var(--primary-color)" }}>Manage Products</Link>
          <Link href="/admin/messages" className="button" style={{ background: "#718096" }}>Messages</Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background: "white", borderRadius: 8, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: "1.6rem", fontWeight: 800, color }}>{value ?? "—"}</div>
      <div style={{ fontSize: "0.8rem", color: "#888", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const colors = {
    pending: "#f3961c", confirmed: "#3182ce", preparing: "#805ad5",
    delivered: "#276749", cancelled: "#e53e3e",
  };
  return (
    <span style={{ background: colors[status] || "#ccc", color: "white", padding: "2px 8px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 600, textTransform: "capitalize" }}>
      {status}
    </span>
  );
}

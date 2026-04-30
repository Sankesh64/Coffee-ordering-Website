"use client";
// app/admin/messages/page.js
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function AdminMessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) router.push("/");
  }, [user, authLoading]);

  useEffect(() => {
    if (user?.role === "admin") fetchMessages();
  }, [user]);

  async function fetchMessages() {
    try {
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      if (res.ok) setMessages(data.messages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function markRead(id) {
    try {
      await fetch(`/api/admin/messages/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "read" }) });
      setMessages((prev) => prev.map((m) => m._id === id ? { ...m, status: "read" } : m));
    } catch (err) { console.error(err); }
  }

  if (authLoading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f7f7f7", padding: "80px 20px 60px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <Link href="/admin" style={{ color: "#888", fontSize: "0.85rem", textDecoration: "none" }}>← Dashboard</Link>
        <h1 style={{ fontSize: "1.8rem", color: "var(--primary-color)", marginTop: 4, marginBottom: 28 }}>Contact Messages</h1>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : messages.length === 0 ? (
          <div className="empty-state"><div className="emoji">✉️</div><p>No messages yet.</p></div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} style={{ background: "white", borderRadius: 8, padding: 20, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: `4px solid ${msg.status === "new" ? "var(--secondary-color)" : "#ccc"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <p style={{ fontWeight: 700 }}>{msg.name}</p>
                    {msg.status === "new" && <span style={{ background: "var(--secondary-color)", color: "white", fontSize: "0.7rem", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>NEW</span>}
                  </div>
                  <p style={{ color: "#888", fontSize: "0.85rem" }}>{msg.email} · {new Date(msg.createdAt).toLocaleDateString("en-IN")}</p>
                  <p style={{ fontWeight: 600, marginTop: 6, fontSize: "0.95rem" }}>{msg.subject}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setExpanded(expanded === msg._id ? null : msg._id)} style={{ padding: "6px 14px", border: "1.5px solid #ccc", borderRadius: 20, background: "none", cursor: "pointer", fontSize: "0.82rem" }}>
                    {expanded === msg._id ? "Collapse" : "Read"}
                  </button>
                  {msg.status === "new" && (
                    <button onClick={() => markRead(msg._id)} style={{ padding: "6px 14px", border: "1.5px solid #38a169", color: "#38a169", borderRadius: 20, background: "none", cursor: "pointer", fontSize: "0.82rem" }}>
                      Mark Read
                    </button>
                  )}
                  <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`} style={{ padding: "6px 14px", background: "var(--primary-color)", color: "white", borderRadius: 20, textDecoration: "none", fontSize: "0.82rem", fontWeight: 600 }}>
                    Reply
                  </a>
                </div>
              </div>
              {expanded === msg._id && (
                <div style={{ marginTop: 16, padding: 16, background: "#f9f9f9", borderRadius: 8, fontSize: "0.9rem", lineHeight: 1.7, whiteSpace: "pre-wrap", color: "#333" }}>
                  {msg.message}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

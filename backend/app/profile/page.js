"use client";
// app/profile/page.js
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("info"); // "info" | "password"
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }

  if (!authLoading && !user) {
    router.push("/auth/login?redirect=/profile");
    return null;
  }
  if (authLoading) return <div className="loading-center"><div className="spinner" /></div>;

  async function saveProfile(e) {
    e.preventDefault();
    if (!form.name.trim()) { setMessage({ type: "error", text: "Name is required." }); return; }
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) {
      setMessage({ type: "error", text: "Invalid phone number." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), phone: form.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (pwdForm.newPassword.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--light-pink-color)", padding: "100px 20px 60px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", color: "var(--primary-color)", marginBottom: 8 }}>My Profile</h1>
        <p style={{ color: "#888", marginBottom: 32 }}>Manage your account details</p>

        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, background: "white", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--primary-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.8rem", fontWeight: 700, flexShrink: 0 }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>{user.name}</p>
            <p style={{ color: "#888", fontSize: "0.9rem" }}>{user.email}</p>
            {user.role === "admin" && (
              <span style={{ background: "var(--secondary-color)", color: "white", fontSize: "0.72rem", padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>ADMIN</span>
            )}
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Link href="/orders" style={{ padding: "8px 18px", borderRadius: 20, border: "1.5px solid var(--primary-color)", color: "var(--primary-color)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
              My Orders
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 24, background: "white", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          {[["info", "Profile Info"], ["password", "Change Password"]].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setMessage(null); }} style={{ flex: 1, padding: "14px 20px", border: "none", background: tab === key ? "var(--primary-color)" : "white", color: tab === key ? "white" : "#555", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Alert */}
        {message && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: 20 }}>
            {message.text}
          </div>
        )}

        {/* Profile Info Tab */}
        {tab === "info" && (
          <div style={{ background: "white", borderRadius: 8, padding: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <form onSubmit={saveProfile}>
              <div className="form-group">
                <label>Full Name *</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" required />
              </div>
              <div className="form-group">
                <label>Email (cannot be changed)</label>
                <input className="form-input" value={user.email} disabled style={{ background: "#f5f5f5", cursor: "not-allowed", opacity: 0.7 }} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} placeholder="10-digit mobile number" maxLength={10} />
              </div>
              <button type="submit" disabled={saving} className="submit-btn" style={{ borderRadius: 30 }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* Change Password Tab */}
        {tab === "password" && (
          <div style={{ background: "white", borderRadius: 8, padding: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <form onSubmit={changePassword}>
              <div className="form-group">
                <label>Current Password *</label>
                <input type="password" className="form-input" value={pwdForm.currentPassword} onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} required autoComplete="current-password" />
              </div>
              <div className="form-group">
                <label>New Password *</label>
                <input type="password" className="form-input" value={pwdForm.newPassword} onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })} placeholder="Min 8 chars, 1 uppercase, 1 number" required autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label>Confirm New Password *</label>
                <input type="password" className="form-input" value={pwdForm.confirmPassword} onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} required autoComplete="new-password" />
              </div>
              <button type="submit" disabled={saving} className="submit-btn" style={{ borderRadius: 30 }}>
                {saving ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

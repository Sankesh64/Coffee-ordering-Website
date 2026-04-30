"use client";
// app/auth/register/page.js
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/menu";

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[0-9]/.test(form.password)) {
      setError("Password must contain at least one number");
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      router.push(redirect);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Join the family ☕</h1>
        <p className="subtitle">Create your account to start ordering</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              className="form-input"
              value={form.name}
              onChange={update("name")}
              placeholder="Your name"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              className="form-input"
              value={form.email}
              onChange={update("email")}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              className="form-input"
              value={form.password}
              onChange={update("password")}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label>Phone (optional)</label>
            <input
              type="tel"
              className="form-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
              placeholder="10-digit mobile"
              maxLength={10}
              autoComplete="tel"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, color: "#666", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "var(--secondary-color)", fontWeight: 600 }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

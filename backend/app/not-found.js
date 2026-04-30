// app/not-found.js
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--light-pink-color)", textAlign: "center", padding: "0 20px" }}>
      <div>
        <p style={{ fontSize: "5rem", marginBottom: 16 }}>☕</p>
        <h1 style={{ fontSize: "3rem", color: "var(--primary-color)", marginBottom: 8 }}>404</h1>
        <h2 style={{ fontSize: "1.4rem", color: "#555", marginBottom: 16, fontWeight: 500 }}>Oops! This page spilled.</h2>
        <p style={{ color: "#888", marginBottom: 32 }}>The page you're looking for doesn't exist or has been moved.</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="button">Go Home</Link>
          <Link href="/menu" style={{ padding: "10px 28px", borderRadius: 30, border: "2px solid var(--primary-color)", color: "var(--primary-color)", textDecoration: "none", fontWeight: 500 }}>
            Browse Menu
          </Link>
        </div>
      </div>
    </div>
  );
}

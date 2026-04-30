"use client";
// app/error.js
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--light-pink-color)", textAlign: "center", padding: "0 20px" }}>
      <div>
        <p style={{ fontSize: "4rem", marginBottom: 16 }}>😞</p>
        <h1 style={{ fontSize: "2rem", color: "var(--primary-color)", marginBottom: 12 }}>Something went wrong</h1>
        <p style={{ color: "#888", marginBottom: 32, maxWidth: 400 }}>
          An unexpected error occurred. Don't worry — your cart and orders are safe.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={reset} className="button">Try Again</button>
          <Link href="/" style={{ padding: "10px 28px", borderRadius: 30, border: "2px solid var(--primary-color)", color: "var(--primary-color)", textDecoration: "none", fontWeight: 500 }}>
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

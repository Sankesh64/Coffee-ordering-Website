"use client";
// components/Navbar.js
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useCart } from "./CartProvider";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/";

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: scrolled ? "rgba(59, 20, 28, 0.98)" : "var(--primary-color)",
        boxShadow: scrolled ? "0 4px 15px rgba(0,0,0,0.2)" : "0 2px 10px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
      }}
    >
      <nav
        className="section-content"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <h2 style={{ color: "var(--white-color)", fontFamily: "Miniver, cursive", fontSize: "1.8rem" }}>
            ☕ Coffee
          </h2>
        </Link>

        {/* Desktop Nav */}
        <ul
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
          className="desktop-nav"
        >
          {isHome && (
            <>
              <li><a href="#about" style={navLinkStyle}>About</a></li>
              <li><a href="#menu" style={navLinkStyle}>Menu</a></li>
              <li><a href="#testimonials" style={navLinkStyle}>Testimonials</a></li>
              <li><a href="#gallery" style={navLinkStyle}>Gallery</a></li>
              <li><a href="#contact" style={navLinkStyle}>Contact</a></li>
            </>
          )}
          <li>
            <Link href="/menu" style={navLinkStyle}>Order</Link>
          </li>

          {/* Cart Icon */}
          <li>
            <Link href="/cart" style={{ ...navLinkStyle, position: "relative" }}>
              🛒
              {totalItems > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "var(--secondary-color)",
                    color: "white",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "0.7rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                  }}
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>
          </li>

          {/* Auth links */}
          {user ? (
            <>
              <li>
                <Link href="/orders" style={navLinkStyle}>
                  My Orders
                </Link>
              </li>
              {user.role === "admin" && (
                <li>
                  <Link href="/admin" style={{ ...navLinkStyle, color: "var(--secondary-color)" }}>
                    Admin
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={logout}
                  style={{
                    ...navLinkStyle,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "6px 16px",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.4)",
                  }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/auth/login" style={navLinkStyle}>Login</Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  style={{
                    padding: "8px 20px",
                    background: "var(--secondary-color)",
                    color: "white",
                    borderRadius: "20px",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                  }}
                >
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}

const navLinkStyle = {
  color: "var(--white-color)",
  textDecoration: "none",
  fontSize: "0.95rem",
  fontWeight: "500",
  opacity: 0.9,
  transition: "opacity 0.2s",
};

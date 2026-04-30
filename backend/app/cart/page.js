"use client";
// app/cart/page.js
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 500;
const GST_RATE = 0.05;

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, hydrated } =
    useCart();

  if (!hydrated) return <div className="loading-center"><div className="spinner" /></div>;

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const taxAmount = Math.round((subtotal + deliveryFee) * GST_RATE * 100) / 100;
  const total = subtotal + deliveryFee + taxAmount;

  return (
    <div className="cart-page">
      <div className="section-content">
        <h1 style={{ fontSize: "2rem", color: "var(--primary-color)", marginBottom: 32 }}>
          Your Cart 🛒
        </h1>

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">☕</div>
            <p style={{ marginBottom: 24 }}>Your cart is empty. Start ordering!</p>
            <Link href="/menu" className="button">Browse Menu</Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Cart Items */}
            <div>
              {items.map((item) => (
                <div key={item.productId} className="cart-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => { e.target.src = "/img/coffee-hero-section.png"; }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>{item.name}</h3>
                    <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: 8 }}>
                      ₹{item.price.toFixed(2)} each
                    </p>
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span style={{ fontWeight: 600, minWidth: 24, textAlign: "center" }}>
                        {item.quantity}
                      </span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        disabled={item.quantity >= 20}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 700, color: "var(--primary-color)" }}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#e53e3e",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        marginTop: 8,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={clearCart}
                style={{
                  background: "none",
                  border: "1.5px solid var(--medium-gray-color)",
                  color: "#666",
                  padding: "8px 20px",
                  borderRadius: 20,
                  cursor: "pointer",
                  marginTop: 8,
                }}
              >
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div>
              <div className="order-summary">
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 20 }}>
                  Order Summary
                </h2>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span style={{ color: "var(--success-color)" }}>FREE</span>
                    ) : (
                      `₹${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="summary-row">
                  <span>GST (5%)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>

                {subtotal < FREE_DELIVERY_THRESHOLD && (
                  <p style={{ fontSize: "0.8rem", color: "#888", marginTop: 12 }}>
                    Add ₹{(FREE_DELIVERY_THRESHOLD - subtotal).toFixed(2)} more for free delivery!
                  </p>
                )}

                <Link href="/checkout" className="button" style={{ display: "block", textAlign: "center", marginTop: 20 }}>
                  Proceed to Checkout
                </Link>
                <Link
                  href="/menu"
                  style={{ display: "block", textAlign: "center", marginTop: 12, color: "#666", fontSize: "0.9rem" }}
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

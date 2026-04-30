"use client";
// app/page.js
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [addedIds, setAddedIds] = useState(new Set());
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactStatus, setContactStatus] = useState(null); // null | "sending" | "success" | "error"
  const [contactMsg, setContactMsg] = useState("");
  const { addItem } = useCart();

  useEffect(() => {
    fetch("/api/products?featured=true&limit=8")
      .then((r) => r.json())
      .then((d) => { if (d.products) setFeaturedProducts(d.products); })
      .catch(() => {});
  }, []);

  function handleAddToCart(product) {
    addItem(product);
    setAddedIds((prev) => new Set([...prev, product._id]));
    setTimeout(() => setAddedIds((prev) => { const n = new Set(prev); n.delete(product._id); return n; }), 1500);
  }

  async function handleContactSubmit(e) {
    e.preventDefault();
    setContactStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setContactStatus("success");
      setContactMsg(data.message);
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setContactStatus("error");
      setContactMsg(err.message || "Failed to send message.");
    }
  }

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        id="home"
        style={{
          background: "var(--primary-color)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="section-content" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", width: "100%" }}>
          <div>
            <p style={{ color: "var(--secondary-color)", fontFamily: "Miniver, cursive", fontSize: "1.3rem", marginBottom: 8 }}>
              Hey! Coffee Lovers
            </p>
            <h1 style={{ color: "var(--white-color)", fontSize: "clamp(2.2rem, 5vw, 3.5rem)", lineHeight: 1.2, marginBottom: 20 }}>
              Start Your Day<br />with <span style={{ color: "var(--secondary-color)" }}>Coffee</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", lineHeight: 1.8, marginBottom: 36, maxWidth: 460 }}>
              Premium coffee beans sourced from the world's finest farms, brewed to perfection and delivered fresh to your door within 45 minutes.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Link href="/menu" className="button">Order Now</Link>
              <Link
                href="#menu"
                style={{
                  padding: "10px 28px", borderRadius: "var(--border-radius-m)",
                  border: "2px solid rgba(255,255,255,0.5)", color: "var(--white-color)",
                  textDecoration: "none", fontWeight: 500, fontSize: "1rem",
                  transition: "all 0.3s",
                }}
              >
                Explore Menu
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 32, marginTop: 48, flexWrap: "wrap" }}>
              {[
                { value: "10K+", label: "Happy Customers" },
                { value: "50+", label: "Coffee Varieties" },
                { value: "4.9★", label: "Average Rating" },
              ].map((s) => (
                <div key={s.label}>
                  <p style={{ color: "var(--secondary-color)", fontSize: "1.6rem", fontWeight: 800 }}>{s.value}</p>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.82rem" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{
              width: "clamp(260px, 40vw, 460px)", height: "clamp(260px, 40vw, 460px)",
              borderRadius: "50%", background: "radial-gradient(circle, rgba(243,150,28,0.25) 0%, transparent 70%)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img
                src="/img/coffee-hero-section.png"
                alt="Coffee"
                style={{ width: "85%", height: "85%", objectFit: "contain", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))" }}
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80"; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────── */}
      <section id="about" style={{ padding: "80px 20px", background: "var(--white-color)" }}>
        <div className="section-content" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <img
              src="/img/about.png"
              alt="About us"
              style={{ width: "100%", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"; }}
            />
          </div>
          <div>
            <p style={{ color: "var(--secondary-color)", fontFamily: "Miniver, cursive", fontSize: "1.2rem", marginBottom: 8 }}>About Us</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "var(--primary-color)", marginBottom: 20, lineHeight: 1.3 }}>
              Why Choose Our Coffee?
            </h2>
            <p style={{ color: "#555", lineHeight: 1.9, marginBottom: 20 }}>
              We're passionate about bringing you the finest coffee experience. Each cup is crafted with hand-selected beans, precision roasting, and barista-level expertise — delivered right to your door.
            </p>
            <p style={{ color: "#555", lineHeight: 1.9, marginBottom: 32 }}>
              From single-origin pour-overs to indulgent cold brews and dessert combos, our menu has something for every coffee lover. We partner with sustainable farms in Ethiopia, Colombia, and India.
            </p>
            <div style={{ display: "flex", gap: 16 }}>
              <Link href="/menu" className="button">Order Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED MENU ────────────────────────────────────────── */}
      <section id="menu" style={{ padding: "80px 20px", background: "var(--light-pink-color)" }}>
        <div className="section-content">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ color: "var(--secondary-color)", fontFamily: "Miniver, cursive", fontSize: "1.2rem" }}>Our Menu</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "var(--primary-color)", marginTop: 4 }}>
              Featured Drinks & Treats
            </h2>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <div key={product._id} className="product-card">
                  <div style={{ position: "relative" }}>
                    <img src={product.image} alt={product.name}
                      style={{ width: "100%", height: 200, objectFit: "cover" }}
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80"; }} />
                    {product.badge && (
                      <span style={{ position: "absolute", top: 12, left: 12, background: "var(--secondary-color)", color: "white", padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600 }}>
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="product-card-body">
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>{product.name}</h3>
                    <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.5, marginBottom: 12,
                      overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {product.description}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="product-price">₹{product.price.toFixed(2)}</span>
                      {product.averageRating > 0 && <span style={{ fontSize: "0.8rem", color: "#888" }}>⭐ {product.averageRating}</span>}
                    </div>
                    <button onClick={() => handleAddToCart(product)} className="add-to-cart-btn"
                      style={{ background: addedIds.has(product._id) ? "var(--success-color)" : undefined }}>
                      {addedIds.has(product._id) ? "✓ Added!" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ color: "#888", marginBottom: 20 }}>Loading featured items...</p>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link href="/menu" className="button" style={{ fontSize: "1.05rem", padding: "12px 36px" }}>
              View Full Menu →
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section id="testimonials" style={{ padding: "80px 20px", background: "var(--white-color)" }}>
        <div className="section-content">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ color: "var(--secondary-color)", fontFamily: "Miniver, cursive", fontSize: "1.2rem" }}>Testimonials</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "var(--primary-color)", marginTop: 4 }}>
              What Our Customers Say
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: "var(--light-pink-color)", borderRadius: 12, padding: 28, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
                <p style={{ fontSize: "2rem", marginBottom: 12 }}>{"⭐".repeat(t.rating)}</p>
                <p style={{ color: "#555", lineHeight: 1.8, marginBottom: 20, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--primary-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1.1rem" }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: "var(--primary-color)" }}>{t.name}</p>
                    <p style={{ fontSize: "0.8rem", color: "#888" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ──────────────────────────────────────────────── */}
      <section id="gallery" style={{ padding: "80px 20px", background: "var(--light-pink-color)" }}>
        <div className="section-content">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ color: "var(--secondary-color)", fontFamily: "Miniver, cursive", fontSize: "1.2rem" }}>Gallery</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "var(--primary-color)", marginTop: 4 }}>
              A Peek Into Our World
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {GALLERY_IMAGES.map((img, i) => (
              <div key={i} style={{ borderRadius: 10, overflow: "hidden", aspectRatio: "1", background: "#eee" }}>
                <img src={img.src} alt={img.alt}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                  onMouseEnter={(e) => { e.target.style.transform = "scale(1.06)"; }}
                  onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }}
                  onError={(e) => { e.target.src = `https://images.unsplash.com/photo-150904223986${i}-f550ce710b93?w=400&q=70`; }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────── */}
      <section id="contact" style={{ padding: "80px 20px", background: "var(--primary-color)" }}>
        <div className="section-content" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
          <div>
            <p style={{ color: "var(--secondary-color)", fontFamily: "Miniver, cursive", fontSize: "1.2rem", marginBottom: 8 }}>Contact Us</p>
            <h2 style={{ color: "var(--white-color)", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", marginBottom: 24 }}>
              Get In Touch
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.9, marginBottom: 32 }}>
              Have a question, feedback, or a custom order request? We'd love to hear from you!
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { icon: "📧", label: "hello@coffee.com" },
                { icon: "📞", label: "+91 98765 43210" },
                { icon: "📍", label: "Mumbai, Maharashtra, India" },
                { icon: "🕐", label: "Mon–Sun: 7 AM – 11 PM" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                  <span style={{ color: "rgba(255,255,255,0.8)" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 32, backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {contactStatus === "success" ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ fontSize: "3rem", marginBottom: 16 }}>☕</p>
                <p style={{ color: "var(--secondary-color)", fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>Message Sent!</p>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>{contactMsg}</p>
                <button onClick={() => setContactStatus(null)} style={{ marginTop: 20, background: "none", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "8px 20px", borderRadius: 20, cursor: "pointer" }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit}>
                {contactStatus === "error" && (
                  <div className="alert alert-error" style={{ marginBottom: 16, background: "rgba(229,62,62,0.2)", border: "1px solid rgba(229,62,62,0.5)", color: "#fed7d7" }}>
                    {contactMsg}
                  </div>
                )}
                {[
                  { label: "Name", field: "name", type: "text", placeholder: "Your name" },
                  { label: "Email", field: "email", type: "email", placeholder: "your@email.com" },
                  { label: "Subject", field: "subject", type: "text", placeholder: "How can we help?" },
                ].map(({ label, field, type, placeholder }) => (
                  <div className="form-group" key={field}>
                    <label style={{ color: "rgba(255,255,255,0.8)" }}>{label}</label>
                    <input
                      type={type}
                      className="form-input"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "white" }}
                      placeholder={placeholder}
                      value={contactForm[field]}
                      onChange={(e) => setContactForm({ ...contactForm, [field]: e.target.value })}
                      required
                    />
                  </div>
                ))}
                <div className="form-group">
                  <label style={{ color: "rgba(255,255,255,0.8)" }}>Message</label>
                  <textarea
                    className="form-input"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "white" }}
                    rows={4}
                    placeholder="Your message..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    minLength={10}
                  />
                </div>
                <button type="submit" disabled={contactStatus === "sending"} className="button" style={{ width: "100%", textAlign: "center", marginTop: 8 }}>
                  {contactStatus === "sending" ? "Sending..." : "Send Message ☕"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{ background: "#1a0a0f", padding: "40px 20px", textAlign: "center" }}>
        <div className="section-content">
          <h3 style={{ color: "var(--white-color)", fontFamily: "Miniver, cursive", fontSize: "1.8rem", marginBottom: 8 }}>☕ Coffee</h3>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", marginBottom: 20 }}>
            Brewing happiness, one cup at a time.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 20 }}>
            {[["Home", "/"], ["Menu", "/menu"], ["Cart", "/cart"], ["Orders", "/orders"]].map(([label, href]) => (
              <Link key={label} href={href} style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.9rem" }}>{label}</Link>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem" }}>
            © {new Date().getFullYear()} Coffee. All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          section > .section-content[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

const TESTIMONIALS = [
  { name: "Priya Sharma", role: "Coffee Enthusiast", rating: 5, text: "The espresso is absolutely divine! Delivered piping hot within 40 minutes. I order every single morning now." },
  { name: "Rahul Verma", role: "Work From Home Dev", rating: 5, text: "Best cold brew in the city. The combo deals are great value and the packaging keeps everything fresh." },
  { name: "Sneha Patel", role: "Blogger", rating: 5, text: "Tried the Ethiopian pour-over and I'm never going back to regular coffee. The origin details make it special." },
  { name: "Arjun Mehta", role: "Startup Founder", rating: 5, text: "I've tried 12 coffee delivery services. This is the only one that consistently nails both quality and speed." },
  { name: "Ananya Gupta", role: "Yoga Instructor", rating: 4, text: "Love the seasonal specials! The website is super easy to use and checkout takes less than a minute." },
  { name: "Vikram Singh", role: "Photographer", rating: 5, text: "The caramel macchiato is worth every rupee. My whole team has switched to this for office orders." },
];

const GALLERY_IMAGES = [
  { src: "/img/menu-1.png", alt: "Espresso" },
  { src: "/img/menu-2.png", alt: "Cappuccino" },
  { src: "/img/menu-3.png", alt: "Cold Brew" },
  { src: "/img/menu-4.png", alt: "Latte" },
  { src: "/img/menu-5.png", alt: "Mocha" },
  { src: "/img/menu-6.png", alt: "Dessert" },
  { src: "/img/gallery-1.png", alt: "Barista" },
  { src: "/img/gallery-2.png", alt: "Coffee Beans" },
];

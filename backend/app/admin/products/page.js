"use client";
// app/admin/products/page.js
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "hot-beverages","cold-beverages","refreshments","special-combo","desserts","snacks"
];

const EMPTY_FORM = {
  name: "", description: "", price: "", category: "hot-beverages",
  image: "", badge: "", strength: "", roast: "", origin: "",
  isAvailable: true, isFeatured: false,
};

export default function AdminProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // null = create mode
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) router.push("/");
  }, [user, authLoading]);

  useEffect(() => {
    if (user?.role === "admin") fetchProducts();
  }, [user, categoryFilter]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      // Admin can see all products including unavailable ones
      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      if (res.ok) setProducts(data.products);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  }

  function openEdit(product) {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      image: product.image,
      badge: product.badge || "",
      strength: product.strength ? String(product.strength) : "",
      roast: product.roast || "",
      origin: product.origin || "",
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured,
    });
    setError("");
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.description.trim() || !form.price || !form.image.trim()) {
      setError("Name, description, price and image are required.");
      return;
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) { setError("Price must be a positive number."); return; }

    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        price,
        strength: form.strength ? parseInt(form.strength) : undefined,
        badge: form.badge || undefined,
        roast: form.roast || undefined,
        origin: form.origin || undefined,
      };

      const url = editProduct ? `/api/products/${editProduct._id}` : "/api/products";
      const method = editProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(product) {
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !product.isAvailable }),
      });
      if (res.ok) {
        setProducts((prev) => prev.map((p) => p._id === product._id ? { ...p, isAvailable: !p.isAvailable } : p));
      }
    } catch (err) { console.error(err); }
  }

  async function handleDelete(product) {
    if (!confirm(`Remove "${product.name}" from the menu?`)) return;
    try {
      const res = await fetch(`/api/products/${product._id}`, { method: "DELETE" });
      if (res.ok) setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) { console.error(err); }
  }

  if (authLoading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f7f7f7", padding: "80px 20px 60px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <Link href="/admin" style={{ color: "#888", fontSize: "0.85rem", textDecoration: "none" }}>← Dashboard</Link>
            <h1 style={{ fontSize: "1.8rem", color: "var(--primary-color)", marginTop: 4 }}>Manage Products</h1>
          </div>
          <button onClick={openCreate} className="button">+ Add Product</button>
        </div>

        {/* Category Filter */}
        <div className="category-tabs" style={{ marginBottom: 24 }}>
          {["all", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCategoryFilter(c)} className={`category-tab ${categoryFilter === c ? "active" : ""}`}>
              {c === "all" ? "All" : c.replace(/-/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase())}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {products.map((product) => (
              <div key={product._id} style={{ background: "white", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", opacity: product.isAvailable ? 1 : 0.6 }}>
                <div style={{ position: "relative" }}>
                  <img src={product.image} alt={product.name} style={{ width: "100%", height: 160, objectFit: "cover" }}
                    onError={(e) => { e.target.src = "/img/coffee-hero-section.png"; }} />
                  {!product.isAvailable && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "white", fontWeight: 700, background: "rgba(229,62,62,0.8)", padding: "4px 12px", borderRadius: 20 }}>Unavailable</span>
                    </div>
                  )}
                  {product.isFeatured && (
                    <span style={{ position: "absolute", top: 8, right: 8, background: "var(--secondary-color)", color: "white", padding: "2px 8px", borderRadius: 12, fontSize: "0.7rem", fontWeight: 700 }}>⭐ Featured</span>
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 4, flex: 1 }}>{product.name}</h3>
                    <span style={{ fontWeight: 700, color: "var(--primary-color)", fontSize: "0.95rem", marginLeft: 8 }}>₹{product.price}</span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "#888", marginBottom: 4, textTransform: "capitalize" }}>
                    {product.category.replace(/-/g, " ")}
                    {product.totalOrdered > 0 && ` · ${product.totalOrdered} sold`}
                  </p>
                  <p style={{ fontSize: "0.82rem", color: "#555", lineHeight: 1.5, marginBottom: 14,
                    overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {product.description}
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => openEdit(product)} style={actionBtn("#3182ce")}>Edit</button>
                    <button onClick={() => toggleAvailability(product)} style={actionBtn(product.isAvailable ? "#f3961c" : "#38a169")}>
                      {product.isAvailable ? "Hide" : "Show"}
                    </button>
                    <button onClick={() => handleDelete(product)} style={actionBtn("#e53e3e")}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: "white", borderRadius: 12, padding: 32, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: "1.3rem", color: "var(--primary-color)" }}>
                {editProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#888" }}>✕</button>
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Product Name *</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Espresso Doppio" />
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Description *</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />
              </div>
              <div className="form-group">
                <label>Price (₹) *</label>
                <input className="form-input" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. 149" />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/-/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase())}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Image URL *</label>
                <input className="form-input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://... or /img/product.jpg" />
              </div>
              <div className="form-group">
                <label>Badge (optional)</label>
                <input className="form-input" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="e.g. Popular, New" />
              </div>
              <div className="form-group">
                <label>Origin (optional)</label>
                <input className="form-input" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="e.g. Ethiopia" />
              </div>
              <div className="form-group">
                <label>Strength (1–5)</label>
                <input className="form-input" type="number" min="1" max="5" value={form.strength} onChange={(e) => setForm({ ...form, strength: e.target.value })} placeholder="1=Mild, 5=Strong" />
              </div>
              <div className="form-group">
                <label>Roast Level</label>
                <select className="form-input" value={form.roast} onChange={(e) => setForm({ ...form, roast: e.target.value })}>
                  <option value="">— Select —</option>
                  {["Light","Light-Medium","Medium","Medium-Dark","Dark"].map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" id="isAvailable" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} style={{ width: 18, height: 18 }} />
                <label htmlFor="isAvailable" style={{ marginBottom: 0 }}>Available on menu</label>
              </div>
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" id="isFeatured" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} style={{ width: 18, height: 18 }} />
                <label htmlFor="isFeatured" style={{ marginBottom: 0 }}>⭐ Featured product</label>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={handleSave} disabled={saving} className="submit-btn" style={{ flex: 1, borderRadius: 30 }}>
                {saving ? "Saving..." : editProduct ? "Update Product" : "Create Product"}
              </button>
              <button onClick={() => setShowModal(false)} style={{ padding: "14px 24px", border: "1.5px solid var(--medium-gray-color)", borderRadius: 30, background: "none", cursor: "pointer", fontWeight: 500 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const actionBtn = (color) => ({
  flex: 1, padding: "7px 4px", border: `1.5px solid ${color}`, borderRadius: 20,
  background: "none", color, cursor: "pointer", fontWeight: 600, fontSize: "0.78rem",
});

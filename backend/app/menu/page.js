"use client";
// app/menu/page.js
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "hot-beverages", label: "☕ Hot Beverages" },
  { key: "cold-beverages", label: "🧊 Cold Beverages" },
  { key: "refreshments", label: "🥤 Refreshments" },
  { key: "special-combo", label: "🎁 Combos" },
  { key: "desserts", label: "🍰 Desserts" },
  { key: "snacks", label: "🍔 Snacks" },
];

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [addedIds, setAddedIds] = useState(new Set());
  const { addItem } = useCart();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, limit: "50" });
      if (category !== "all") params.set("category", category);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (res.ok) setProducts(data.products);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, [category, sort, search]);

  useEffect(() => {
    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [fetchProducts]);

  function handleAddToCart(product) {
    addItem(product);
    setAddedIds((prev) => new Set([...prev, product._id]));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(product._id);
        return next;
      });
    }, 1500);
  }

  return (
    <div className="menu-page">
      <div className="section-content">
        <h1 style={{ fontSize: "2rem", color: "var(--primary-color)", marginBottom: 8 }}>
          Our Menu
        </h1>
        <p style={{ color: "#666", marginBottom: 32 }}>
          Freshly made, delivered to your door ☕
        </p>

        {/* Search + Sort */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search coffee, desserts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ maxWidth: 320 }}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="form-input"
            style={{ maxWidth: 200 }}
          >
            <option value="popular">Most Popular</option>
            <option value="price">Price: Low to High</option>
            <option value="rating">Top Rated</option>
            <option value="createdAt">Newest First</option>
          </select>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`category-tab ${category === c.key ? "active" : ""}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">☕</div>
            <p>No items found. Try a different category or search.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
                isAdded={addedIds.has(product._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart, isAdded }) {
  return (
    <div className="product-card">
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img
          src={product.image}
          alt={product.name}
          style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
          onError={(e) => { e.target.src = "/img/coffee-hero-section.png"; }}
        />
        {product.badge && (
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "var(--secondary-color)",
              color: "white",
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            {product.badge}
          </span>
        )}
      </div>

      <div className="product-card-body">
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 4 }}>
          {product.name}
        </h3>
        {product.origin && (
          <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: 6 }}>
            Origin: {product.origin}
          </p>
        )}
        <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: 12, lineHeight: 1.5 }}>
          {product.description}
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="product-price">₹{product.price.toFixed(2)}</span>
          {product.averageRating > 0 && (
            <span style={{ fontSize: "0.8rem", color: "#888" }}>
              ⭐ {product.averageRating}
            </span>
          )}
        </div>

        <button
          onClick={onAddToCart}
          className="add-to-cart-btn"
          style={{
            background: isAdded ? "var(--success-color)" : undefined,
            transition: "background 0.3s",
          }}
        >
          {isAdded ? "✓ Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

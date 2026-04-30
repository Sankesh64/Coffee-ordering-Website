const API_BASE_URL = "http://localhost:3001";
const STORAGE_KEYS = {
  cart: "coffee_cart_items",
  orders: "coffee_orders",
  contacts: "coffee_contacts",
};

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn("Storage read failed:", error);
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizePrice(value) {
  if (typeof value === "number") return value;
  const cleaned = String(value).replace(/[^\d.]/g, "");
  return Number.parseFloat(cleaned) || 0;
}

function getFallbackProductsFromCards() {
  return Array.from(document.querySelectorAll(".variety-card")).map((card, index) => ({
    id: `local-${index + 1}`,
    name: card.querySelector(".variety-name")?.textContent?.trim() || `Coffee ${index + 1}`,
    price: normalizePrice(card.querySelector(".variety-price")?.textContent || "0"),
    image: card.querySelector(".variety-image")?.getAttribute("src") || "",
  }));
}

async function fetchProductsFromBackend() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (!response.ok) throw new Error("Products request failed");
    const payload = await response.json();
    const products = payload?.data?.products || [];
    return products.map((item) => ({
      id: item._id,
      name: item.name,
      price: Number(item.price) || 0,
      image: item.image || "",
    }));
  } catch (error) {
    console.warn("Backend not reachable, using local product source.");
    return getFallbackProductsFromCards();
  }
}

function getCart() {
  return readStorage(STORAGE_KEYS.cart, []);
}

function setCart(cartItems) {
  writeStorage(STORAGE_KEYS.cart, cartItems);
  window.dispatchEvent(new CustomEvent("coffee-cart-updated", { detail: cartItems }));
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  setCart(cart);
}

function updateCartBadge() {
  const badge = document.querySelector(".cart-badge");
  if (!badge) return;
  const quantity = getCart().reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = String(quantity);
  badge.style.display = quantity > 0 ? "inline-flex" : "none";
}

function showToast(message, isError = false) {
  const node = document.createElement("div");
  node.textContent = message;
  node.style.cssText = `
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 10000;
    font-weight: 600;
    color: #fff;
    background: ${isError ? "#d9534f" : "#28a745"};
  `;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 2500);
}

async function handleContactForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const values = {
      name: form.querySelector('input[placeholder="Your Name"]')?.value.trim() || "",
      email: form.querySelector('input[placeholder="Your Email"]')?.value.trim() || "",
      subject: form.querySelector('input[placeholder="Subject"]')?.value.trim() || "",
      message: form.querySelector("textarea")?.value.trim() || "",
    };

    let backendSaved = false;
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      backendSaved = response.ok;
    } catch (error) {
      backendSaved = false;
    }

    const contacts = readStorage(STORAGE_KEYS.contacts, []);
    contacts.unshift({
      ...values,
      backendSaved,
      createdAt: new Date().toISOString(),
    });
    writeStorage(STORAGE_KEYS.contacts, contacts);

    form.reset();
    showToast(backendSaved ? "Message sent to backend and saved locally." : "Message saved locally.");
  });
}

function bindOrderButtons(products) {
  const buttons = Array.from(document.querySelectorAll(".order-btn"));
  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const fallback = getFallbackProductsFromCards()[index];
      const cardName = button.closest(".variety-card")?.querySelector(".variety-name")?.textContent?.trim();
      const matched = products.find((item) => item.name.toLowerCase() === (cardName || "").toLowerCase());
      addToCart(matched || fallback);
      showToast(`${(matched || fallback).name} added to cart`);
    });
  });
}

window.CoffeeApp = {
  getCart,
  setCart,
  readStorage,
  writeStorage,
  STORAGE_KEYS,
  showToast,
};

document.addEventListener("DOMContentLoaded", async () => {
  const products = await fetchProductsFromBackend();
  bindOrderButtons(products);
  updateCartBadge();
  handleContactForm();
});

window.addEventListener("coffee-cart-updated", updateCartBadge);

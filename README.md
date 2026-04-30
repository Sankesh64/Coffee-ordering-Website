# Coffee Ordering Website (Frontend)

## Overview
This frontend is now connected to your Next.js backend (`coffee-app-fullstack/coffee-app`) and includes localStorage-based persistence for cart, orders, and contact records.

## What Is Interactive Now
- Add items from landing page cards to cart
- Cart badge updates live
- Dedicated cart + checkout page at `order.html`
- Checkout stores orders in browser localStorage
- Contact form submits to backend (`/api/contact`) when available and always stores a local backup
- Product loading tries backend (`/api/products`) first, then falls back to local card data

## Storage Keys
- `coffee_cart_items`
- `coffee_orders`
- `coffee_contacts`

## Run Backend (Required for API connection)
From `c:\Users\Sankesh Pal\Downloads\coffee-app-fullstack\coffee-app`:

```bash
npm install
npm run dev
```

Backend runs on `http://localhost:3000`.

## Run Frontend
Serve this folder using any static server (for example VS Code Live Server) and open `index.html`.

## Files Added/Updated
- `enhanced-script.js` (backend connection + local persistence)
- `order.html` (cart and checkout page)
- `cart-styles.css` (cart UI styles)
- `first.js` (contact submit moved to enhanced script)


# ☕ Coffee — Full-Stack Ordering App

A production-ready coffee ordering platform built with **Next.js 14**, **MongoDB**, and **Razorpay**.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18 |
| Backend | Next.js API Routes (Edge-compatible) |
| Database | MongoDB + Mongoose |
| Payments | Razorpay (UPI, Cards, Net Banking, Wallets) |
| Auth | JWT (httpOnly cookies) |
| Validation | Zod |
| Styling | CSS Variables + Custom CSS |

---

## 📁 Project Structure

```
coffee-app/
├── app/
│   ├── page.js                    # Home / Landing page
│   ├── layout.js                  # Root layout (Navbar, Providers)
│   ├── menu/page.js               # Browse & order menu
│   ├── cart/page.js               # Shopping cart
│   ├── checkout/page.js           # Address + payment
│   ├── order/[id]/page.js         # Order confirmation + tracking
│   ├── orders/page.js             # Order history
│   ├── profile/page.js            # User profile
│   ├── auth/
│   │   ├── login/page.js
│   │   └── register/page.js
│   ├── admin/
│   │   ├── page.js                # Dashboard
│   │   ├── orders/page.js         # Manage orders
│   │   ├── products/page.js       # Manage products
│   │   └── messages/page.js       # Contact messages
│   └── api/
│       ├── auth/                  # register, login, logout, me
│       ├── products/              # CRUD + reviews
│       ├── orders/                # Create, list, update
│       ├── payment/               # create-order, verify, webhook
│       ├── contact/               # Contact form
│       ├── user/                  # profile, change-password
│       └── admin/                 # stats, orders, products, messages
├── components/
│   ├── AuthProvider.js            # Auth context
│   ├── CartProvider.js            # Cart context + localStorage
│   ├── Navbar.js
│   └── Toast.js
├── lib/
│   ├── mongodb.js                 # Connection pooling
│   ├── auth.js                    # JWT helpers + middleware HOC
│   ├── apiResponse.js             # Standardised responses
│   ├── validations.js             # Zod schemas
│   ├── rateLimit.js               # In-memory rate limiter
│   └── razorpay.js               # Razorpay client + signature verify
├── models/
│   ├── User.js                    # bcrypt, account lock, saved addresses
│   ├── Product.js                 # Reviews, ratings, featured
│   ├── Order.js                   # Full payment lifecycle
│   └── Contact.js
├── middleware.js                  # Route protection (Next.js edge middleware)
├── scripts/seed.js                # DB seeder (30 products + admin user)
└── .env.example                   # All required environment variables
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd coffee-app
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/coffee-app
JWT_SECRET=your-super-secret-key-minimum-32-characters
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret   # From Razorpay Dashboard
ADMIN_EMAIL=admin@coffee.com
ADMIN_PASSWORD=Admin@123456
```

### 3. Seed the Database

```bash
npm run seed
# To force re-seed products:
node scripts/seed.js --force
```

This creates:
- **30 products** across 6 categories (hot, cold, refreshments, combos, desserts, snacks)
- **1 admin user** (credentials from `.env.local`)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 💳 Razorpay Integration

### Setup Steps

1. Create account at [razorpay.com](https://razorpay.com)
2. Get **Test API Keys** from Dashboard → Settings → API Keys
3. Add to `.env.local`
4. For webhooks: Dashboard → Webhooks → Add `https://yourdomain.com/api/payment/webhook`

### Payment Flow

```
User places order → POST /api/orders (creates DB order)
                 → POST /api/payment/create-order (creates Razorpay order)
                 → Razorpay Checkout modal opens
                 → User pays (UPI / Card / Net Banking)
                 → POST /api/payment/verify (verifies HMAC signature ✅)
                 → Order confirmed + user redirected
                 → Webhook /api/payment/webhook (server-side backup)
```

### Test Cards

| Card | Number | CVV | Expiry |
|------|--------|-----|--------|
| Visa | 4111 1111 1111 1111 | Any | Any future |
| Mastercard | 5267 3181 8797 5449 | Any | Any future |

**Test UPI:** `success@razorpay`

---

## 🔐 Security Features

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcrypt with 12 rounds |
| Account lockout | 5 failed attempts → 30-min lock |
| JWT | httpOnly, secure, sameSite=strict cookies |
| Rate limiting | Per-IP, per-route (login: 10/15min, register: 5/hr) |
| Payment verification | HMAC-SHA256 signature with `timingSafeEqual` |
| Input validation | Zod schemas on every API route |
| Duplicate key | 11000 MongoDB error → user-friendly message |
| Server-side pricing | Client prices are NEVER trusted; always fetched from DB |
| Admin protection | Role check on every admin route + middleware |
| Timing attacks | Simulated delay when email not found during login |
| Webhook auth | Separate webhook secret, independent verification |
| XSS | httpOnly cookies prevent JS access to JWT |
| Clickjacking | `X-Frame-Options: DENY` header |

---

## 📦 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/logout` | — | Logout (clears cookie) |
| GET | `/api/auth/me` | ✅ | Get current user |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | — | List (category, search, sort, page) |
| POST | `/api/products` | Admin | Create product |
| GET | `/api/products/:id` | — | Get single product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Soft-delete product |
| POST | `/api/products/:id/reviews` | ✅ | Add review (must have purchased) |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/orders` | ✅ | My orders (paginated) |
| POST | `/api/orders` | ✅ | Create order |
| GET | `/api/orders/:id` | ✅ | Order detail |
| PATCH | `/api/orders/:id` | ✅ | Cancel order / Admin: update status |

### Payment
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payment/create-order` | ✅ | Create Razorpay order |
| POST | `/api/payment/verify` | ✅ | Verify payment signature |
| POST | `/api/payment/webhook` | — | Razorpay webhook (signed) |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/orders` | Admin | All orders (filter, search) |
| GET | `/api/admin/products` | Admin | All products (incl. unavailable) |
| GET | `/api/admin/messages` | Admin | Contact messages |
| PATCH | `/api/admin/messages/:id` | Admin | Mark message as read/replied |

---

## 🌱 Seeded Products (30 items)

| Category | Items |
|----------|-------|
| ☕ Hot Beverages | Espresso, Cappuccino, Caramel Macchiato, Flat White, Masala Chai, Pour Over, Americano, Mocha |
| 🧊 Cold Beverages | Cold Brew, Iced Caramel Latte, Nitro Cold Brew, Iced Matcha, Cold Brew Tonic |
| 🥤 Refreshments | Watermelon Juice, Mango Lassi, Lemonade Fizz, Watermelon Mint Cooler |
| 🎁 Special Combos | Morning Starter, WFH Pack, Date Night Duo, Afternoon Delight |
| 🍰 Desserts | Belgian Chocolate Cake, NY Cheesecake, Tiramisu, Lava Cake, Banana Bread |
| 🍔 Snacks | Chicken Club Sandwich, Butter Croissant, Avocado Toast, Veggie Wrap |

---

## 🚢 Deployment (Vercel)

```bash
npm run build   # Ensure build passes locally first
```

1. Push to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Deploy!

> **Note:** Switch Razorpay to **Live Mode** keys for production. The webhook URL will be `https://your-domain.vercel.app/api/payment/webhook`.

---

## 🐛 Edge Cases Handled

- ✅ Cart persists across page refreshes (localStorage)
- ✅ Razorpay SDK loaded dynamically (no SSR issues)
- ✅ Payment modal dismissed → order saved, retryable
- ✅ Duplicate payment requests are idempotent
- ✅ Server-side price validation (client prices ignored)
- ✅ Products soft-deleted (historical orders unaffected)
- ✅ Order cancellation only allowed on pending/confirmed status
- ✅ Reviews only allowed for delivered orders (prevents fake reviews)
- ✅ MongoDB connection pooled (dev hot-reload safe)
- ✅ Rate limiting on all sensitive endpoints
- ✅ Zod validation on every API route input
- ✅ Mongoose `ValidationError` and duplicate key `11000` handled
- ✅ Free delivery threshold (₹500+) calculated server-side
- ✅ GST (5%) calculated and stored with order
- ✅ Order status history tracked with timestamps
- ✅ Admin can see all products including unavailable ones
- ✅ Non-admin users cannot access `/admin/*` routes

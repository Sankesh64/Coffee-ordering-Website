// scripts/seed.js
// Run with: node scripts/seed.js
// Make sure MONGODB_URI and ADMIN_EMAIL/ADMIN_PASSWORD are in .env.local

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

// ── Inline Schemas (avoid ES module issues in seed script) ──────────
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: { type: String, default: "user" }, isActive: { type: Boolean, default: true },
  loginAttempts: { type: Number, default: 0 },
}, { timestamps: true });

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const ProductSchema = new mongoose.Schema({
  name: String, description: String, price: Number, category: String,
  image: String, badge: String, strength: Number, roast: String, origin: String,
  isAvailable: { type: Boolean, default: true }, isFeatured: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 }, reviewCount: { type: Number, default: 0 },
  totalOrdered: { type: Number, default: 0 }, reviews: { type: Array, default: [] },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

// ── Seed Data ──────────────────────────────────────────────────────
const PRODUCTS = [
  // Hot Beverages
  {
    name: "Espresso Doppio", description: "A rich double shot of premium espresso. Bold, concentrated, and deeply aromatic with notes of dark chocolate.",
    price: 99, category: "hot-beverages", image: "/img/menu-1.png",
    badge: "Best Seller", strength: 5, roast: "Dark", origin: "Ethiopia",
    isFeatured: true,
  },
  {
    name: "Cappuccino Classico", description: "Perfectly balanced espresso with velvety steamed milk and a thick layer of micro-foam. Italian café tradition in every sip.",
    price: 149, category: "hot-beverages", image: "/img/menu-2.png",
    badge: "Popular", strength: 3, roast: "Medium", origin: "Colombia",
    isFeatured: true,
  },
  {
    name: "Caramel Macchiato", description: "Espresso layered over creamy steamed milk, drizzled with rich caramel sauce. Sweet, indulgent, and beautiful.",
    price: 179, category: "hot-beverages", image: "/img/menu-3.png",
    badge: "Fan Favourite", strength: 2, roast: "Light-Medium",
    isFeatured: true,
  },
  {
    name: "Flat White", description: "A velvety double ristretto with silky steamed whole milk. Stronger than a latte, smoother than a cappuccino.",
    price: 159, category: "hot-beverages", image: "/img/menu-4.png",
    strength: 4, roast: "Medium-Dark", origin: "Australia",
  },
  {
    name: "Masala Chai Latte", description: "A comforting blend of strong Assam tea, cardamom, ginger, and cinnamon with creamy steamed milk.",
    price: 119, category: "hot-beverages", image: "/img/menu-5.png",
    badge: "Indian Special", strength: 2,
    isFeatured: true,
  },
  {
    name: "Pour Over Single Origin", description: "Slow-dripped to perfection through a Hario V60. Clean, bright, floral notes. Our most nuanced cup.",
    price: 199, category: "hot-beverages", image: "/img/menu-6.png",
    badge: "Specialty", strength: 3, roast: "Light", origin: "Kenya",
    isFeatured: true,
  },
  {
    name: "Americano", description: "Espresso diluted with hot water for a clean, elongated black coffee. Smooth and straightforward.",
    price: 89, category: "hot-beverages", image: "/img/menu-1.png",
    strength: 4, roast: "Medium",
  },
  {
    name: "Mocha", description: "Rich espresso blended with premium Belgian chocolate sauce and steamed milk. Topped with whipped cream.",
    price: 169, category: "hot-beverages", image: "/img/menu-2.png",
    badge: "Dessert Coffee", strength: 2,
  },

  // Cold Beverages
  {
    name: "Cold Brew", description: "12-hour cold-steeped coffee. Naturally sweet, low-acid, and intensely smooth. Served over ice.",
    price: 169, category: "cold-beverages", image: "/img/menu-3.png",
    badge: "Summer Hit", strength: 4, roast: "Dark", origin: "Brazil",
    isFeatured: true,
  },
  {
    name: "Iced Caramel Latte", description: "Double espresso over cold milk and ice with house-made caramel syrup. Sweet, strong, and totally refreshing.",
    price: 179, category: "cold-beverages", image: "/img/menu-4.png",
    badge: "Fan Favourite", strength: 2,
  },
  {
    name: "Nitro Cold Brew", description: "Cold brew infused with nitrogen for a creamy, Guinness-like texture. No milk needed — naturally silky.",
    price: 219, category: "cold-beverages", image: "/img/menu-5.png",
    badge: "Premium", strength: 5, roast: "Medium-Dark",
  },
  {
    name: "Iced Matcha Latte", description: "Premium ceremonial-grade matcha whisked into cold milk over ice. Earthy, vibrant, and energising.",
    price: 189, category: "cold-beverages", image: "/img/menu-6.png",
    badge: "Healthy", strength: 1,
  },
  {
    name: "Cold Brew Tonic", description: "Cold brew floated over sparkling tonic water with a citrus twist. Surprisingly delightful.",
    price: 199, category: "cold-beverages", image: "/img/menu-1.png",
    badge: "Trending", strength: 3,
  },

  // Refreshments
  {
    name: "Fresh Watermelon Juice", description: "Freshly pressed watermelon, served cold with a hint of mint and black salt. 100% natural, no added sugar.",
    price: 99, category: "refreshments", image: "/img/menu-2.png",
    badge: "100% Natural",
  },
  {
    name: "Mango Lassi", description: "Thick, creamy Indian yoghurt blended with Alphonso mango pulp and a pinch of cardamom. Summer in a glass.",
    price: 129, category: "refreshments", image: "/img/menu-3.png",
    badge: "Seasonal",
    isFeatured: true,
  },
  {
    name: "Lemonade Fizz", description: "Fresh lemon juice with sparkling water, cane sugar, and a touch of ginger. Zingy and addictive.",
    price: 89, category: "refreshments", image: "/img/menu-4.png",
  },
  {
    name: "Watermelon Mint Cooler", description: "Blended watermelon with fresh mint leaves, lime juice, and chia seeds. Cool, hydrating, and beautiful.",
    price: 119, category: "refreshments", image: "/img/menu-5.png",
  },

  // Special Combos
  {
    name: "Morning Starter Combo", description: "Your choice of any hot beverage + a butter croissant + scrambled eggs on toast. The perfect start to any day.",
    price: 349, category: "special-combo", image: "/img/menu-6.png",
    badge: "Best Value", isFeatured: true,
  },
  {
    name: "WFH Productivity Pack", description: "2 Americanos + a club sandwich + a brownie. Fuel your remote work session all morning long.",
    price: 499, category: "special-combo", image: "/img/menu-1.png",
    badge: "WFH Favourite", isFeatured: true,
  },
  {
    name: "Date Night Duo", description: "2 Cappuccinos + 2 pastries of your choice. Perfect for a cosy evening for two.",
    price: 449, category: "special-combo", image: "/img/menu-2.png",
    badge: "For Two",
  },
  {
    name: "Afternoon Delight", description: "Cold brew + banana loaf + a chocolate truffle. The 3 PM pick-me-up you deserve.",
    price: 299, category: "special-combo", image: "/img/menu-3.png",
  },

  // Desserts
  {
    name: "Belgian Chocolate Truffle Cake", description: "Rich layers of Belgian dark chocolate ganache and moist sponge. Decadent, intense, and deeply satisfying.",
    price: 179, category: "desserts", image: "/img/menu-4.png",
    badge: "Signature", isFeatured: true,
  },
  {
    name: "New York Cheesecake", description: "Classic baked cheesecake with a buttery graham cracker crust. Dense, creamy, and utterly indulgent.",
    price: 169, category: "desserts", image: "/img/menu-5.png",
    badge: "Classic",
  },
  {
    name: "Tiramisu", description: "Espresso-soaked ladyfingers layered with mascarpone cream and dusted with cocoa. The original coffee dessert.",
    price: 189, category: "desserts", image: "/img/menu-6.png",
    badge: "Coffee Lover's Pick",
  },
  {
    name: "Chocolate Lava Cake", description: "Warm chocolate sponge with a molten dark chocolate centre. Served with a scoop of vanilla gelato.",
    price: 199, category: "desserts", image: "/img/menu-1.png",
    badge: "Warm & Gooey",
  },
  {
    name: "Banana Walnut Bread", description: "Freshly baked every morning. Moist, fragrant, and studded with crunchy walnuts. Pairs perfectly with coffee.",
    price: 89, category: "desserts", image: "/img/menu-2.png",
  },

  // Snacks
  {
    name: "Chicken Club Sandwich", description: "Triple-decker grilled chicken, streaky bacon, lettuce, tomato, and garlic aioli on toasted brioche.",
    price: 249, category: "snacks", image: "/img/menu-3.png",
    badge: "Filling",
  },
  {
    name: "Butter Croissant", description: "Freshly baked all-butter croissant. Flaky, golden, and impossibly light. Classic French bakery quality.",
    price: 69, category: "snacks", image: "/img/menu-4.png",
    badge: "Baked Fresh",
  },
  {
    name: "Avocado Toast", description: "Sourdough toast topped with smashed avocado, poached egg, cherry tomatoes, and a sprinkle of chilli flakes.",
    price: 199, category: "snacks", image: "/img/menu-5.png",
    badge: "Brunch Fave",
  },
  {
    name: "Veggie Wrap", description: "Whole wheat wrap with hummus, roasted bell peppers, spinach, cucumber, and feta. Light and satisfying.",
    price: 179, category: "snacks", image: "/img/menu-6.png",
    badge: "Vegetarian",
  },
];

async function seed() {
  console.log("🌱 Starting seed...");

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // ── Seed Admin User ──────────────────────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL || "admin@coffee.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`ℹ️  Admin already exists: ${adminEmail}`);
    } else {
      await User.create({ name: "Admin", email: adminEmail, password: adminPassword, role: "admin" });
      console.log(`✅ Admin user created: ${adminEmail}`);
    }

    // ── Seed Products ────────────────────────────────────────────
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`ℹ️  ${existingCount} products already exist. Skipping product seed.`);
      console.log("   To re-seed products, run: node scripts/seed.js --force");

      if (!process.argv.includes("--force")) {
        await mongoose.disconnect();
        console.log("✅ Seed complete.");
        return;
      }

      console.log("⚠️  --force flag detected: clearing existing products...");
      await Product.deleteMany({});
    }

    await Product.insertMany(PRODUCTS);
    console.log(`✅ ${PRODUCTS.length} products seeded`);

    // Print summary by category
    const categories = [...new Set(PRODUCTS.map((p) => p.category))];
    categories.forEach((cat) => {
      const count = PRODUCTS.filter((p) => p.category === cat).length;
      console.log(`   • ${cat}: ${count} products`);
    });

    await mongoose.disconnect();
    console.log("\n🎉 Seed complete! You're ready to brew.\n");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();

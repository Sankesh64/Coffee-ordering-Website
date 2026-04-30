// lib/validations.js
import { z } from "zod";

// ─── Auth ──────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number (10 digits, starts with 6-9)")
    .optional()
    .or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

// ─── Products ──────────────────────────────────────────────────────
export const productSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  price: z.number().positive("Price must be positive").max(10000),
  category: z.enum([
    "hot-beverages",
    "cold-beverages",
    "refreshments",
    "special-combo",
    "desserts",
    "snacks",
  ]),
  image: z.string().url("Invalid image URL").or(z.string().startsWith("/")),
  isAvailable: z.boolean().default(true),
  badge: z.string().max(20).optional(),
  strength: z.number().min(1).max(5).optional(),
  roast: z
    .enum(["Light", "Light-Medium", "Medium", "Medium-Dark", "Dark"])
    .optional(),
  origin: z.string().max(50).optional(),
});

// ─── Orders ───────────────────────────────────────────────────────
export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(20, "Max 20 of any single item"),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, "Cart cannot be empty")
    .max(20, "Too many items"),
  deliveryAddress: z.object({
    fullName: z.string().min(2).max(100),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Invalid phone number"),
    addressLine1: z.string().min(5).max(200),
    addressLine2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    pincode: z
      .string()
      .regex(/^\d{6}$/, "Pincode must be 6 digits"),
  }),
  paymentMethod: z.enum(["razorpay", "cod"]),
  specialInstructions: z.string().max(300).optional(),
});

// ─── Contact ──────────────────────────────────────────────────────
export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(3).max(200),
  message: z
    .string()
    .min(10, "Message too short")
    .max(2000, "Message too long"),
});

// ─── Review ───────────────────────────────────────────────────────
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(500),
  productId: z.string().min(1),
});

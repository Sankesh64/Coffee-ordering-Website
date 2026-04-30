// app/api/admin/stats/route.js
import { connectDB } from "@/lib/mongodb";
import { withAuth } from "@/lib/auth";
import { apiSuccess, withErrorHandler } from "@/lib/apiResponse";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Contact from "@/models/Contact";

export const GET = withAuth(
  withErrorHandler(async (request) => {
    await connectDB();

    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalOrders,
      todayOrders,
      monthOrders,
      pendingOrders,
      totalRevenue,
      monthRevenue,
      totalProducts,
      availableProducts,
      totalUsers,
      newMessages,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ status: { $in: ["pending", "confirmed", "preparing"] } }),

      // Total revenue from paid orders
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      // This month's revenue
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),

      Product.countDocuments(),
      Product.countDocuments({ isAvailable: true }),
      User.countDocuments({ role: "user" }),
      Contact.countDocuments({ status: "new" }),

      // Recent 5 orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("orderNumber status totalAmount createdAt paymentMethod"),

      // Top selling products
      Product.find()
        .sort({ totalOrdered: -1 })
        .limit(5)
        .select("name totalOrdered price category"),
    ]);

    return apiSuccess({
      stats: {
        orders: {
          total: totalOrders,
          today: todayOrders,
          thisMonth: monthOrders,
          pending: pendingOrders,
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          thisMonth: monthRevenue[0]?.total || 0,
        },
        products: {
          total: totalProducts,
          available: availableProducts,
        },
        users: { total: totalUsers },
        messages: { unread: newMessages },
      },
      recentOrders,
      topProducts,
    });
  }),
  { adminOnly: true }
);

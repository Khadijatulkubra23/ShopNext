const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const getStats = async (req, res) => {
  try {
    const keys = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      keys.push(d.toISOString().slice(0, 10));
    }
    const since = new Date(`${keys[0]}T00:00:00.000Z`);
    const active = { orderStatus: { $ne: "cancelled" } };

    const [
      revenueAgg,
      totalOrders,
      totalProducts,
      totalUsers,
      statusAgg,
      dailyAgg,
      topProducts,
      lowStockCount,
      lowStockProducts,
      recentOrders,
      recentUsers,
    ] = await Promise.all([
      Order.aggregate([
        { $match: active },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: "user" }),
      Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { ...active, createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        { $match: active },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.name",
            sold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { sold: -1 } },
        { $limit: 5 },
      ]),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(5).select("name stock"),
      Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name"),
      User.find().sort({ createdAt: -1 }).limit(5).select("name role createdAt"),
    ]);

    const ordersByStatus = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    statusAgg.forEach((s) => {
      ordersByStatus[s._id] = s.count;
    });

    const revenueByDay = keys.map((date) => {
      const found = dailyAgg.find((d) => d._id === date);
      return { date, revenue: found?.revenue || 0, orders: found?.orders || 0 };
    });

    res.json({
      totalRevenue: revenueAgg[0]?.total || 0,
      totalOrders,
      totalProducts,
      totalUsers,
      pendingOrders: ordersByStatus.pending,
      ordersByStatus,
      revenueByDay,
      topProducts,
      lowStockCount,
      lowStockProducts,
      recentOrders,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard stats", error: error.message });
  }
};

module.exports = { getStats };
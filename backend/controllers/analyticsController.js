const Order = require("../models/orderModel");
const PurchaseOrder = require("../models/purchaseOrderModel");
const Supplier = require("../models/supplierModel");
const Product = require("../models/productModel");
const Inventory = require("../models/inventoryModel");
const User = require("../models/userModel");

// -----------------------------------------------
// @route   GET /api/analytics/dashboard
// @desc    Get all dashboard stats in one call
// @access  Admin, Warehouse Manager
// -----------------------------------------------
const getDashboardStats = async (req, res) => {
  try {
    // --- Counts ---
    const totalSuppliers = await Supplier.countDocuments({ isActive: true });
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const totalPurchaseOrders = await PurchaseOrder.countDocuments();
    const totalUsers = await User.countDocuments({ isActive: true });

    // --- Order Status Breakdown ---
    const orderStatusBreakdown = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // --- Purchase Order Status Breakdown ---
    const poStatusBreakdown = await PurchaseOrder.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // --- Inventory Summary ---
    const inventoryData = await Inventory.find().populate("product", "name category");
    const totalInventoryValue = await Inventory.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productData",
        },
      },
      { $unwind: "$productData" },
      {
        $project: {
          inventoryValue: {
            $multiply: ["$availableStock", "$productData.costPrice"],
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$inventoryValue" } } },
    ]);

    const lowStockItems = inventoryData.filter(
      (item) => item.availableStock <= item.minimumStockLevel
    );

    // --- Total Revenue from delivered orders ---
    const revenueData = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);

    // --- Total Procurement Cost ---
    const procurementData = await PurchaseOrder.aggregate([
      { $match: { status: "Delivered" } },
      { $group: { _id: null, totalCost: { $sum: "$totalAmount" } } },
    ]);

    // --- Recent 5 Orders ---
    const recentOrders = await Order.find()
      .populate("retailer", "name organization")
      .populate("items.product", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // --- Recent 5 Purchase Orders ---
    const recentPurchaseOrders = await PurchaseOrder.find()
      .populate("supplier", "name supplierCode")
      .sort({ createdAt: -1 })
      .limit(5);

    // --- Top Suppliers by performance ---
    const topSuppliers = await Supplier.find({ isActive: true })
      .sort({ performanceScore: -1 })
      .limit(5)
      .select("name supplierCode performanceScore onTimeDelivery qualityScore");

    res.status(200).json({
      counts: {
        totalSuppliers,
        totalProducts,
        totalOrders,
        totalPurchaseOrders,
        totalUsers,
        lowStockItems: lowStockItems.length,
      },
      financials: {
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        totalProcurementCost: procurementData[0]?.totalCost || 0,
        totalInventoryValue: totalInventoryValue[0]?.total || 0,
      },
      orderStatusBreakdown,
      poStatusBreakdown,
      recentOrders,
      recentPurchaseOrders,
      topSuppliers,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -----------------------------------------------
// @route   GET /api/analytics/inventory
// @desc    Inventory analytics
// @access  Admin, Warehouse Manager
// -----------------------------------------------
const getInventoryAnalytics = async (req, res) => {
  try {
    const inventory = await Inventory.find().populate(
      "product",
      "name sku category costPrice"
    );

    // Category-wise stock summary
    const categoryMap = {};
    inventory.forEach((item) => {
      const cat = item.product?.category || "Other";
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          category: cat,
          totalAvailable: 0,
          totalReserved: 0,
          totalInTransit: 0,
          totalValue: 0,
          itemCount: 0,
        };
      }
      categoryMap[cat].totalAvailable += item.availableStock;
      categoryMap[cat].totalReserved += item.reservedStock;
      categoryMap[cat].totalInTransit += item.inTransitStock;
      categoryMap[cat].totalValue +=
        item.availableStock * (item.product?.costPrice || 0);
      categoryMap[cat].itemCount += 1;
    });

    const lowStockItems = inventory.filter(
      (item) => item.availableStock <= item.minimumStockLevel
    );

    res.status(200).json({
      totalProducts: inventory.length,
      lowStockCount: lowStockItems.length,
      categoryBreakdown: Object.values(categoryMap),
      lowStockItems: lowStockItems.map((item) => ({
        product: item.product?.name,
        sku: item.product?.sku,
        available: item.availableStock,
        minimum: item.minimumStockLevel,
        location: item.warehouseLocation,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -----------------------------------------------
// @route   GET /api/analytics/orders
// @desc    Order analytics
// @access  Admin
// -----------------------------------------------
const getOrderAnalytics = async (req, res) => {
  try {
    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 }, revenue: { $sum: "$totalAmount" } } },
    ]);

    // Monthly orders (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({ ordersByStatus, monthlyOrders });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -----------------------------------------------
// @route   GET /api/analytics/suppliers
// @desc    Supplier performance analytics
// @access  Admin
// -----------------------------------------------
const getSupplierAnalytics = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isActive: true }).select(
      "name supplierCode performanceScore onTimeDelivery qualityScore location"
    );

    // Purchase orders per supplier
    const poBySupplier = await PurchaseOrder.aggregate([
      {
        $group: {
          _id: "$supplier",
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({ suppliers, poBySupplier });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getInventoryAnalytics,
  getOrderAnalytics,
  getSupplierAnalytics,
};

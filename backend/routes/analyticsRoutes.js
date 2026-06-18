const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getInventoryAnalytics,
  getOrderAnalytics,
  getSupplierAnalytics,
} = require("../controllers/analyticsController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, authorizeRoles("admin", "warehouse_manager"), getDashboardStats);
router.get("/inventory", protect, authorizeRoles("admin", "warehouse_manager"), getInventoryAnalytics);
router.get("/orders", protect, authorizeRoles("admin"), getOrderAnalytics);
router.get("/suppliers", protect, authorizeRoles("admin"), getSupplierAnalytics);

module.exports = router;

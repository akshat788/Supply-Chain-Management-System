const express = require("express");
const router = express.Router();
const {
  getTransactions,
  getTransactionsByProduct,
  createTransaction,
} = require("../controllers/inventoryTransactionController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", protect, authorizeRoles("admin", "warehouse_manager"), getTransactions);
router.get("/product/:productId", protect, authorizeRoles("admin", "warehouse_manager"), getTransactionsByProduct);
router.post("/", protect, authorizeRoles("admin", "warehouse_manager"), createTransaction);

module.exports = router;

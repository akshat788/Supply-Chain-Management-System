const InventoryTransaction = require("../models/inventoryTransactionModel");
const Inventory = require("../models/inventoryModel");

// GET all transactions
const getTransactions = async (req, res) => {
  try {
    const transactions = await InventoryTransaction.find()
      .populate("product", "name sku category")
      .populate("performedBy", "name role")
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ count: transactions.length, transactions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET transactions for a specific product
const getTransactionsByProduct = async (req, res) => {
  try {
    const transactions = await InventoryTransaction.find({ product: req.params.productId })
      .populate("product", "name sku")
      .populate("performedBy", "name role")
      .sort({ createdAt: -1 });
    res.status(200).json({ count: transactions.length, transactions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST manual adjustment
const createTransaction = async (req, res) => {
  try {
    const { product, action, quantity, type, reference, notes } = req.body;

    const transaction = await InventoryTransaction.create({
      product, action, quantity, type, reference, notes,
      performedBy: req.user._id,
    });

    // Update inventory
    const inv = await Inventory.findOne({ product });
    if (inv) {
      if (type === "IN") inv.availableStock += Number(quantity);
      else if (type === "OUT") inv.availableStock = Math.max(0, inv.availableStock - Number(quantity));
      inv.lastUpdated = Date.now();
      await inv.save();
    }

    res.status(201).json({ message: "Transaction recorded", transaction });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getTransactions, getTransactionsByProduct, createTransaction };

const PurchaseOrder = require("../models/purchaseOrderModel");
const Inventory = require("../models/inventoryModel");
const InventoryTransaction = require("../models/inventoryTransactionModel");

const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate("supplier", "name supplierCode email phone contactPerson")
      .populate("items.product", "name sku")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPurchaseOrderById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate("supplier", "name supplierCode email phone contactPerson")
      .populate("items.product", "name sku unit")
      .populate("createdBy", "name email");
    if (!order) return res.status(404).json({ message: "Purchase order not found" });
    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createPurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.create({
      ...req.body,
      createdBy: req.user ? req.user._id : null,
    });
    res.status(201).json({ message: "Purchase order created successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Purchase order not found" });

    const previousStatus = order.status;

    if (previousStatus !== status) {
      if (status === "Shipped") {
        for (const item of order.items) {
          try {
            let inv = await Inventory.findOne({ product: item.product });
            if (inv) {
              inv.inTransitStock += item.quantity;
              inv.lastUpdated = Date.now();
              await inv.save();
            } else {
              await Inventory.create({
                product: item.product,
                availableStock: 0,
                reservedStock: 0,
                inTransitStock: item.quantity,
                warehouseLocation: "Main Warehouse",
                minimumStockLevel: 10,
                maximumStockLevel: 1000,
              });
            }
          } catch (err) {
            console.error("Inventory error (Shipped):", err.message);
          }
        }
      }

      if (status === "Delivered") {
        order.deliveredDate = Date.now();
        for (const item of order.items) {
          try {
            let inv = await Inventory.findOne({ product: item.product });
            if (inv) {
              inv.availableStock += item.quantity;
              inv.inTransitStock = Math.max(0, inv.inTransitStock - item.quantity);
              inv.lastUpdated = Date.now();
              await inv.save();
            } else {
              await Inventory.create({
                product: item.product,
                availableStock: item.quantity,
                reservedStock: 0,
                inTransitStock: 0,
                warehouseLocation: "Main Warehouse",
                minimumStockLevel: 10,
                maximumStockLevel: 1000,
              });
            }
            // Log inventory transaction
            await InventoryTransaction.create({
              product: item.product,
              action: "PO Delivered",
              quantity: item.quantity,
              type: "IN",
              reference: order.poNumber,
              performedBy: req.user ? req.user._id : null,
              notes: `Stock received from PO ${order.poNumber}`,
            });
          } catch (err) {
            console.error("Inventory error (Delivered):", err.message);
          }
        }
      }
    }

    order.status = status;
    await order.save();
    res.status(200).json({ message: `Purchase order marked as ${status}`, order });
  } catch (error) {
    console.error("updatePurchaseOrderStatus error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deletePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Purchase order not found" });
    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Only pending orders can be deleted" });
    }
    await order.deleteOne();
    res.status(200).json({ message: "Purchase order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
};

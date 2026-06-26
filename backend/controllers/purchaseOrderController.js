const PurchaseOrder = require("../models/purchaseOrderModel");
const Inventory = require("../models/inventoryModel");
const InventoryTransaction = require("../models/inventoryTransactionModel");

// Valid status transitions for PO
const allowedTransitions = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],     // Terminal state
  Cancelled: [],     // Terminal state
};

// Role permissions per transition
const transitionPermissions = {
  "Pending->Confirmed": ["admin", "warehouse_manager"],
  "Pending->Cancelled": ["admin", "warehouse_manager"],
  "Confirmed->Shipped": ["admin", "supplier"],
  "Confirmed->Cancelled": ["admin", "supplier"],
  "Shipped->Delivered": ["admin", "warehouse_manager"],
};

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
      .populate("createdBy", "name email")
      .populate("statusHistory.userId", "name role");
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
    const { status, trackingNumber, courierName, expectedDeliveryDate, notes } = req.body;
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Purchase order not found" });

    const currentStatus = order.status;

    // Check terminal states
    if (currentStatus === "Delivered" || currentStatus === "Cancelled") {
      return res.status(400).json({
        message: `Order is already ${currentStatus}. No further changes allowed.`,
      });
    }

    // Check valid transition
    const allowed = allowedTransitions[currentStatus] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid transition: ${currentStatus} → ${status}. Allowed: ${allowed.join(", ") || "none"}`,
      });
    }

    // Check role permission for this transition
    const transitionKey = `${currentStatus}->${status}`;
    const allowedRoles = transitionPermissions[transitionKey] || [];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Your role (${req.user.role}) cannot perform this status change. Allowed roles: ${allowedRoles.join(", ")}`,
      });
    }

    // Handle Shipped
    if (status === "Shipped") {
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (courierName) order.courierName = courierName;
      if (expectedDeliveryDate) order.expectedDeliveryDate = expectedDeliveryDate;

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

    // Handle Delivered — only add inventory ONCE
    if (status === "Delivered" && !order.inventoryUpdated) {
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
      order.inventoryUpdated = true; // Mark so it never runs again
    }

    // Add to audit trail
    order.statusHistory.push({
      from: currentStatus,
      to: status,
      changedBy: req.user.name,
      userId: req.user._id,
      timestamp: new Date(),
    });

    order.status = status;
    if (notes) order.notes = notes;
    await order.save();

    res.status(200).json({ message: `Purchase order marked as ${status}`, order });
  } catch (error) {
    console.error("updatePurchaseOrderStatus error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Supplier action on PO
const supplierActionOnPO = async (req, res) => {
  try {
    const { action, notes, trackingNumber, courierName, expectedDeliveryDate } = req.body;
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Purchase order not found" });

    const currentStatus = order.status;

    // Check terminal states
    if (currentStatus === "Delivered" || currentStatus === "Cancelled") {
      return res.status(400).json({
        message: `Order is already ${currentStatus}. No further changes allowed.`,
      });
    }

    // Validate supplier can do this action
    if (action === "Confirmed" && currentStatus !== "Pending") {
      return res.status(400).json({ message: "Can only confirm pending orders." });
    }
    if (action === "Shipped" && currentStatus !== "Confirmed") {
      return res.status(400).json({ message: "Can only ship confirmed orders." });
    }
    if (action === "Cancelled" && !["Pending", "Confirmed"].includes(currentStatus)) {
      return res.status(400).json({ message: "Cannot cancel this order." });
    }

    if (action === "Shipped") {
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (courierName) order.courierName = courierName;
      if (expectedDeliveryDate) order.expectedDeliveryDate = expectedDeliveryDate;

      for (const item of order.items) {
        try {
          let inv = await Inventory.findOne({ product: item.product });
          if (inv) {
            inv.inTransitStock += item.quantity;
            inv.lastUpdated = Date.now();
            await inv.save();
          } else {
            await Inventory.create({
              product: item.product, availableStock: 0,
              reservedStock: 0, inTransitStock: item.quantity,
              warehouseLocation: "Main Warehouse",
              minimumStockLevel: 10, maximumStockLevel: 1000,
            });
          }
        } catch (err) {
          console.error("Inventory error:", err.message);
        }
      }
    }

    // Audit trail
    order.statusHistory.push({
      from: currentStatus,
      to: action,
      changedBy: req.user.name,
      userId: req.user._id,
      timestamp: new Date(),
    });

    order.status = action;
    if (notes) order.notes = notes;
    await order.save();

    res.status(200).json({ message: `Purchase order ${action}`, order });
  } catch (error) {
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

// Get allowed next statuses for a given role and current status
const getAllowedStatuses = (currentStatus, role) => {
  const transitions = allowedTransitions[currentStatus] || [];
  return transitions.filter(nextStatus => {
    const key = `${currentStatus}->${nextStatus}`;
    const roles = transitionPermissions[key] || [];
    return roles.includes(role);
  });
};

module.exports = {
  getPurchaseOrders, getPurchaseOrderById,
  createPurchaseOrder, updatePurchaseOrderStatus,
  supplierActionOnPO, deletePurchaseOrder, getAllowedStatuses,
};

const Order = require("../models/orderModel");
const Inventory = require("../models/inventoryModel");
const InventoryTransaction = require("../models/inventoryTransactionModel");

// Valid transitions for Orders
const allowedTransitions = {
  Pending: ["Approved", "Cancelled"],
  Approved: ["Allocated", "Cancelled"],
  Allocated: ["Dispatched", "Cancelled"],
  Dispatched: ["Delivered"],
  Delivered: [],    // Terminal
  Cancelled: [],    // Terminal
};

// Role permissions per transition
const transitionPermissions = {
  "Pending->Approved": ["admin", "warehouse_manager"],
  "Pending->Cancelled": ["admin", "warehouse_manager", "retailer"],
  "Approved->Allocated": ["admin", "warehouse_manager"],
  "Approved->Cancelled": ["admin", "warehouse_manager"],
  "Allocated->Dispatched": ["admin", "warehouse_manager"],
  "Allocated->Cancelled": ["admin", "warehouse_manager"],
  "Dispatched->Delivered": ["admin", "warehouse_manager"],
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("retailer", "name email organization phone")
      .populate("items.product", "name sku")
      .sort({ createdAt: -1 });
    res.status(200).json({ count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("retailer", "name email organization phone")
      .populate("items.product", "name sku unit")
      .populate("statusHistory.userId", "name role");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ retailer: req.user._id })
      .populate("items.product", "name sku")
      .sort({ createdAt: -1 });
    res.status(200).json({ count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    // Check inventory availability
    for (const item of req.body.items) {
      const inventory = await Inventory.findOne({ product: item.product });
      if (!inventory || inventory.availableStock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${item.product}`,
        });
      }
    }
    const order = await Order.create({ ...req.body, retailer: req.user._id });
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

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

    // Check role permission
    const transitionKey = `${currentStatus}->${status}`;
    const allowedRoles = transitionPermissions[transitionKey] || [];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Your role (${req.user.role}) cannot perform this transition.`,
      });
    }

    // Approved → reserve stock (only once)
    if (status === "Approved" && !order.inventoryUpdated) {
      for (const item of order.items) {
        const inventory = await Inventory.findOne({ product: item.product });
        if (inventory) {
          inventory.availableStock -= item.quantity;
          inventory.reservedStock += item.quantity;
          inventory.lastUpdated = Date.now();
          await inventory.save();
        }
      }
      order.inventoryUpdated = true;
    }

    // Dispatched → move reserved to in-transit
    if (status === "Dispatched") {
      for (const item of order.items) {
        const inventory = await Inventory.findOne({ product: item.product });
        if (inventory) {
          inventory.reservedStock = Math.max(0, inventory.reservedStock - item.quantity);
          inventory.inTransitStock += item.quantity;
          inventory.lastUpdated = Date.now();
          await inventory.save();
        }
      }
    }

    // Delivered → remove from in-transit, log transaction
    if (status === "Delivered") {
      order.deliveredDate = Date.now();
      for (const item of order.items) {
        const inventory = await Inventory.findOne({ product: item.product });
        if (inventory) {
          inventory.inTransitStock = Math.max(0, inventory.inTransitStock - item.quantity);
          inventory.lastUpdated = Date.now();
          await inventory.save();
        }
        try {
          await InventoryTransaction.create({
            product: item.product,
            action: "Retail Order",
            quantity: item.quantity,
            type: "OUT",
            reference: order.orderNumber,
            performedBy: req.user._id,
            notes: `Stock dispatched for Order ${order.orderNumber}`,
          });
        } catch (err) {
          console.error("Transaction log error:", err.message);
        }
      }
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
    await order.save();

    res.status(200).json({ message: `Order marked as ${status}`, order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }
    await order.deleteOne();
    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get allowed next statuses for role
const getAllowedOrderStatuses = (currentStatus, role) => {
  const transitions = allowedTransitions[currentStatus] || [];
  return transitions.filter(nextStatus => {
    const key = `${currentStatus}->${nextStatus}`;
    const roles = transitionPermissions[key] || [];
    return roles.includes(role);
  });
};

module.exports = {
  getOrders, getOrderById, getMyOrders,
  createOrder, updateOrderStatus, deleteOrder,
  getAllowedOrderStatuses,
};

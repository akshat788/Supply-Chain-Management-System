const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    action: {
      type: String,
      enum: ["PO Delivered", "Retail Order", "Manual Adjustment", "Stock Transfer", "Damaged", "Returned"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true, // positive = stock in, negative = stock out
    },
    type: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
    },
    reference: {
      type: String, // PO number or Order number
      default: "",
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryTransaction", inventoryTransactionSchema);

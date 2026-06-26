const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Retailer is required"],
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        totalPrice: { type: Number, default: 0 },
      },
    ],
    totalAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Allocated", "Dispatched", "Delivered", "Cancelled"],
      default: "Pending",
    },
    inventoryUpdated: { type: Boolean, default: false }, // prevent duplicate inventory deductions
    shippingAddress: { type: String, default: "" },
    notes: { type: String, default: "" },
    expectedDeliveryDate: { type: Date, default: null },
    deliveredDate: { type: Date, default: null },
    // Audit trail
    statusHistory: [
      {
        from: { type: String },
        to: { type: String },
        changedBy: { type: String },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${String(count + 1).padStart(3, "0")}`;
  }
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((sum, item) => {
      item.totalPrice = item.quantity * item.unitPrice;
      return sum + item.totalPrice;
    }, 0);
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);

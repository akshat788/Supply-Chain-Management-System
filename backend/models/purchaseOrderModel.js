const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, unique: true },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Supplier is required"],
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
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    inventoryUpdated: { type: Boolean, default: false }, // prevent duplicate inventory adds
    trackingNumber: { type: String, default: "" },
    courierName: { type: String, default: "" },
    expectedDeliveryDate: { type: Date, default: null },
    deliveredDate: { type: Date, default: null },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
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

purchaseOrderSchema.pre("save", async function (next) {
  if (!this.poNumber) {
    const count = await mongoose.model("PurchaseOrder").countDocuments();
    this.poNumber = `PO-${Date.now()}-${String(count + 1).padStart(3, "0")}`;
  }
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((sum, item) => {
      item.totalPrice = item.quantity * item.unitPrice;
      return sum + item.totalPrice;
    }, 0);
  }
  next();
});

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);

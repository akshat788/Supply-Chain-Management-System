// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());                       // Allow frontend (different port) to call this API
app.use(express.json());               // Parse JSON request bodies
app.use(morgan("dev"));                // Log incoming requests to console

// Test route - confirms server is running
app.get("/", (req, res) => {
  res.json({ message: "SCM Backend API is running successfully 🚀" });
});

// ---- Routes ----
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/suppliers", require("./routes/supplierRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/purchase-orders", require("./routes/purchaseOrderRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

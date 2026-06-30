import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Card, CardContent, Typography, CircularProgress,
  Alert, MenuItem, Select, FormControl, InputLabel,
  Stepper, Step, StepLabel, StepContent, Chip, Grid,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

const SupplyChainTracking = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get("/products");
        setProducts(data.products);
      } catch {
        setError("Failed to load products.");
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    const fetchTracking = async () => {
      setLoading(true);
      setError("");
      try {
        const [poRes, invRes, ordRes] = await Promise.all([
          API.get("/purchase-orders"),
          API.get("/inventory"),
          API.get("/orders"),
        ]);

        const product = products.find(p => p._id === selectedProduct);
        const pos = poRes.data.orders.filter(po =>
          po.items?.some(item => item.product?._id === selectedProduct || item.product === selectedProduct)
        );
        const inv = invRes.data.inventory.find(i =>
          i.product?._id === selectedProduct || i.product === selectedProduct
        );
        const orders = ordRes.data.orders.filter(o =>
          o.items?.some(item => item.product?._id === selectedProduct || item.product === selectedProduct)
        );

        setTrackingData({ product, purchaseOrders: pos, inventory: inv, orders });
      } catch {
        setError("Failed to load tracking data.");
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
  }, [selectedProduct]);

  const getStep = () => {
    if (!trackingData) return 0;
    const { purchaseOrders, inventory, orders } = trackingData;
    if (orders.some(o => o.status === "Delivered")) return 5;
    if (orders.some(o => ["Dispatched", "Allocated", "Approved"].includes(o.status))) return 4;
    if (orders.length > 0) return 4;
    if (inventory && inventory.availableStock > 0) return 3;
    if (purchaseOrders.some(po => po.status === "Delivered")) return 3;
    if (purchaseOrders.some(po => po.status === "Shipped")) return 2;
    if (purchaseOrders.some(po => po.status === "Confirmed")) return 1;
    if (purchaseOrders.length > 0) return 1;
    return 0;
  };

  const activeStep = getStep();

  const steps = [
    {
      label: "Supplier",
      description: trackingData?.product?.supplier ? `Supplied by ${trackingData.product.supplier?.name || "Linked Supplier"}` : "No supplier linked",
      done: activeStep >= 1,
    },
    {
      label: "Purchase Order Created",
      description: trackingData?.purchaseOrders?.length > 0
        ? `${trackingData.purchaseOrders.length} PO(s) — Latest: ${trackingData.purchaseOrders[0]?.status}`
        : "No purchase orders yet",
      done: activeStep >= 1,
    },
    {
      label: "Shipped to Warehouse",
      description: trackingData?.purchaseOrders?.some(po => ["Shipped", "Delivered"].includes(po.status))
        ? "Goods shipped from supplier"
        : "Not shipped yet",
      done: activeStep >= 2,
    },
    {
      label: "Warehouse Received & Inventory Updated",
      description: trackingData?.inventory
        ? `Available: ${trackingData.inventory.availableStock} units at ${trackingData.inventory.warehouseLocation}`
        : "Not received yet",
      done: activeStep >= 3,
    },
    {
      label: "Retail Order Placed",
      description: trackingData?.orders?.length > 0
        ? `${trackingData.orders.length} order(s) placed — Latest: ${trackingData.orders[0]?.status}`
        : "No retail orders yet",
      done: activeStep >= 4,
    },
    {
      label: "Delivered to Retailer",
      description: trackingData?.orders?.some(o => o.status === "Delivered")
        ? "Successfully delivered to retailer"
        : "Not delivered yet",
      done: activeStep >= 5,
    },
  ];

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Supply Chain Tracking</Typography>
        <Typography variant="body2" color="text.secondary">Track the complete lifecycle of any product</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
        <CardContent>
          <FormControl fullWidth size="small">
            <InputLabel>Select a Product to Track</InputLabel>
            <Select value={selectedProduct} label="Select a Product to Track"
              onChange={(e) => setSelectedProduct(e.target.value)}>
              {products.map(p => (
                <MenuItem key={p._id} value={p._id}>{p.name} — {p.sku}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {loading && <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>}

      {trackingData && !loading && (
        <>
          {/* Product Summary */}
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">Product</Typography>
                  <Typography variant="h6" fontWeight={600}>{trackingData.product?.name}</Typography>
                  <Chip label={trackingData.product?.sku} size="small" sx={{ mt: 0.5 }} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">Category</Typography>
                  <Typography variant="body1" fontWeight={500}>{trackingData.product?.category}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">Current Stock</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {trackingData.inventory ? `${trackingData.inventory.availableStock} units` : "Not in inventory"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="caption" color="text.secondary">Lifecycle Stage</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={steps[Math.min(activeStep, steps.length - 1)]?.label}
                      color={activeStep >= 5 ? "success" : "primary"}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Stepper Timeline */}
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>Product Lifecycle</Typography>
              <Stepper orientation="vertical" activeStep={activeStep}>
                {steps.map((step, index) => (
                  <Step key={step.label} completed={step.done}>
                    <StepLabel
                      StepIconComponent={() => (
                        step.done
                          ? <CheckCircleIcon sx={{ color: "#66bb6a", fontSize: 28 }} />
                          : <RadioButtonUncheckedIcon sx={{ color: "#bdbdbd", fontSize: 28 }} />
                      )}
                    >
                      <Typography variant="body1" fontWeight={step.done ? 600 : 400}
                        color={step.done ? "#1a1a2e" : "text.secondary"}>
                        {step.label}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {step.description}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {activeStep >= 5 && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: "#e8f5e9", borderRadius: 2, textAlign: "center" }}>
                  <CheckCircleIcon sx={{ color: "#66bb6a", fontSize: 40 }} />
                  <Typography variant="h6" fontWeight={600} color="#66bb6a">
                    Complete Supply Chain Cycle Finished!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This product has completed its full journey from supplier to retailer.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedProduct && !loading && (
        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6" color="text.secondary" mb={1}>Select a product above</Typography>
            <Typography variant="body2" color="text.secondary">
              Track the complete lifecycle from supplier → warehouse → retailer
            </Typography>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
};

export default SupplyChainTracking;

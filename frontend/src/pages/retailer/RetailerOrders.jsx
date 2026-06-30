import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/cartSlice";
import {
  Box, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, ToggleButton,
  ToggleButtonGroup, Stepper, Step, StepLabel, Grid,
} from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";

const statusColors = {
  Pending: "warning", Approved: "info", Allocated: "secondary",
  Dispatched: "primary", Delivered: "success", Cancelled: "error",
};

const orderSteps = ["Pending", "Approved", "Allocated", "Dispatched", "Delivered"];

const RetailerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders/my-orders");
        setOrders(data.orders);
        setFiltered(data.orders);
      } catch {
        setError("Failed to load your orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (statusFilter === "All") setFiltered(orders);
    else setFiltered(orders.filter(o => o.status === statusFilter));
  }, [statusFilter, orders]);

  const handleReorder = (order) => {
    order.items?.forEach(item => {
      if (item.product) {
        dispatch(addToCart({
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }));
      }
    });
    setSuccess("Items added to cart! Go to Products to checkout.");
    navigate("/retailer/products");
  };

  const getActiveStep = (status) => {
    const index = orderSteps.indexOf(status);
    return index === -1 ? 0 : index;
  };

  const statuses = ["All", "Pending", "Approved", "Dispatched", "Delivered", "Cancelled"];

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a1a2e">My Orders</Typography>
        <Typography variant="body2" color="text.secondary">Track and manage your orders</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {/* Status Filter */}
      <Box sx={{ mb: 3, overflowX: "auto" }}>
        <ToggleButtonGroup value={statusFilter} exclusive
          onChange={(e, val) => val && setStatusFilter(val)} size="small">
          {statuses.map(s => (
            <ToggleButton key={s} value={s}>{s}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableRow>
                    {["Order #", "Items", "Total", "Status", "Date", "Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(order => (
                      <TableRow key={order._id} hover>
                        <TableCell fontWeight={500}>{order.orderNumber}</TableCell>
                        <TableCell>{order.items?.length} item(s)</TableCell>
                        <TableCell>₹{order.totalAmount?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip label={order.status} size="small" color={statusColors[order.status] || "default"} />
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="info"
                            onClick={() => { setSelectedOrder(order); setViewOpen(true); }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          {order.status === "Delivered" && (
                            <IconButton size="small" color="primary" title="Reorder"
                              onClick={() => handleReorder(order)}>
                              <ReplayIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Order Details + Tracking Timeline Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={600}>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              {/* Tracking Timeline */}
              <Card sx={{ mb: 3, p: 2, backgroundColor: "#f8f9fa", borderRadius: 2 }} elevation={0}>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>Order Tracking</Typography>
                <Stepper activeStep={getActiveStep(selectedOrder.status)} alternativeLabel>
                  {orderSteps.map(label => (
                    <Step key={label} completed={orderSteps.indexOf(label) < getActiveStep(selectedOrder.status)}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Card>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>Order Info</Typography>
                  {[
                    { label: "Order Number", value: selectedOrder.orderNumber },
                    { label: "Status", value: selectedOrder.status },
                    { label: "Total Amount", value: `₹${selectedOrder.totalAmount?.toLocaleString()}` },
                    { label: "Shipping Address", value: selectedOrder.shippingAddress || "—" },
                    { label: "Order Date", value: new Date(selectedOrder.createdAt).toLocaleDateString() },
                    { label: "Notes", value: selectedOrder.notes || "—" },
                  ].map(item => (
                    <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid #f0f0f0" }}>
                      <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                      <Typography variant="body2" fontWeight={500}>{item.value}</Typography>
                    </Box>
                  ))}
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>Items Ordered</Typography>
                  {selectedOrder.items?.map((item, i) => (
                    <Box key={i} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid #f0f0f0" }}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{item.product?.name || "Product"}</Typography>
                        <Typography variant="caption" color="text.secondary">Qty: {item.quantity}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={500}>
                        ₹{item.totalPrice?.toLocaleString() || (item.quantity * item.unitPrice).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                  <Box sx={{ mt: 1, pt: 1, display: "flex", justifyContent: "space-between" }}>
                    <Typography fontWeight={600}>Total</Typography>
                    <Typography fontWeight={600} color="#1a1a2e">₹{selectedOrder.totalAmount?.toLocaleString()}</Typography>
                  </Box>
                </Grid>
              </Grid>

              {selectedOrder.status === "Delivered" && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: "#e8f5e9", borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="#66bb6a" fontWeight={500}>
                    ✅ Order successfully delivered!
                  </Typography>
                  <Button size="small" variant="outlined" startIcon={<ReplayIcon />}
                    onClick={() => { setViewOpen(false); handleReorder(selectedOrder); }}
                    sx={{ color: "#66bb6a", borderColor: "#66bb6a" }}>
                    Reorder
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default RetailerOrders;

import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, FormControl,
  InputLabel, Select, MenuItem, IconButton, Grid, Stepper,
  Step, StepLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

const statusColors = {
  Pending: "warning", Approved: "info", Allocated: "secondary",
  Dispatched: "primary", Delivered: "success", Cancelled: "error",
};

const orderSteps = ["Pending", "Approved", "Allocated", "Dispatched", "Delivered"];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/orders");
      setOrders(data.orders);
    } catch {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async () => {
    try {
      await API.put(`/orders/${selectedOrder._id}/status`, { status: newStatus });
      setSuccess(`Order marked as ${newStatus}`);
      setStatusOpen(false);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    }
  };

  const getActiveStep = (status) => {
    const index = orderSteps.indexOf(status);
    return index === -1 ? 0 : index;
  };

  const getETA = (order) => {
    if (order.expectedDeliveryDate) return new Date(order.expectedDeliveryDate).toLocaleDateString();
    const created = new Date(order.createdAt);
    created.setDate(created.getDate() + 5);
    return created.toLocaleDateString() + " (est.)";
  };

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Orders</Typography>
        <Typography variant="body2" color="text.secondary">Manage and fulfill retailer orders</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableRow>
                    {["Order #", "Retailer", "Contact", "Items", "Total", "Status", "ETA", "Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: "#1a1a2e" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No orders yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map(o => (
                      <TableRow key={o._id} hover>
                        <TableCell><Chip label={o.orderNumber} size="small" /></TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{o.retailer?.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{o.retailer?.organization}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">{o.retailer?.email}</Typography>
                        </TableCell>
                        <TableCell>{o.items?.length} item(s)</TableCell>
                        <TableCell>₹{o.totalAmount?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip label={o.status} size="small" color={statusColors[o.status] || "default"} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color={o.status === "Delivered" ? "success.main" : "text.secondary"}>
                            {o.status === "Delivered" ? "✅ Delivered" : getETA(o)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="info"
                            onClick={() => { setSelectedOrder(o); setViewOpen(true); }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="primary"
                            onClick={() => { setSelectedOrder(o); setNewStatus(o.status); setStatusOpen(true); }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
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

      {/* View Order Dialog with Stepper */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={600}>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              {/* Shipping Status Stepper */}
              <Card sx={{ mb: 3, p: 2, backgroundColor: "#f8f9fa", borderRadius: 2 }} elevation={0}>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>Shipping Status</Typography>
                <Stepper activeStep={getActiveStep(selectedOrder.status)} alternativeLabel>
                  {orderSteps.map(label => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Card>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>Order Info</Typography>
                  {[
                    { label: "Order Number", value: selectedOrder.orderNumber },
                    { label: "Status", value: selectedOrder.status },
                    { label: "Total Amount", value: `₹${selectedOrder.totalAmount?.toLocaleString()}` },
                    { label: "Shipping Address", value: selectedOrder.shippingAddress || "—" },
                    { label: "Expected Delivery", value: getETA(selectedOrder) },
                    { label: "Delivered On", value: selectedOrder.deliveredDate ? new Date(selectedOrder.deliveredDate).toLocaleDateString() : "Not yet" },
                    { label: "Notes", value: selectedOrder.notes || "—" },
                  ].map(item => (
                    <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid #f0f0f0" }}>
                      <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                      <Typography variant="body2" fontWeight={500}>{item.value}</Typography>
                    </Box>
                  ))}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>Retailer Info</Typography>
                  {[
                    { label: "Name", value: selectedOrder.retailer?.name },
                    { label: "Organization", value: selectedOrder.retailer?.organization || "—" },
                    { label: "Email", value: selectedOrder.retailer?.email },
                    { label: "Phone", value: selectedOrder.retailer?.phone || "—" },
                  ].map(item => (
                    <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid #f0f0f0" }}>
                      <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                      <Typography variant="body2" fontWeight={500}>{item.value}</Typography>
                    </Box>
                  ))}
                  <Typography variant="subtitle2" fontWeight={600} mt={2} mb={1}>Items Ordered</Typography>
                  {selectedOrder.items?.map((item, i) => (
                    <Box key={i} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid #f0f0f0" }}>
                      <Typography variant="body2">{item.product?.name || "Product"}</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {item.quantity} × ₹{item.unitPrice} = ₹{item.totalPrice?.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusOpen} onClose={() => setStatusOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={600}>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl size="small" fullWidth sx={{ mt: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select value={newStatus} label="Status" onChange={(e) => setNewStatus(e.target.value)}>
              {["Pending", "Approved", "Allocated", "Dispatched", "Delivered", "Cancelled"].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setStatusOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleStatusUpdate}
            sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" } }}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Orders;

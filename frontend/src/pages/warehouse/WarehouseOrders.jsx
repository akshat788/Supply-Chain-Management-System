import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, FormControl,
  InputLabel, Select, MenuItem, IconButton, Stepper,
  Step, StepLabel, Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

const statusColors = {
  Pending: "warning", Approved: "info", Allocated: "secondary",
  Dispatched: "primary", Delivered: "success", Cancelled: "error",
};

const orderSteps = ["Pending", "Approved", "Allocated", "Dispatched", "Delivered"];

const allowedTransitions = {
  Pending: ["Approved", "Cancelled"],
  Approved: ["Allocated", "Cancelled"],
  Allocated: ["Dispatched", "Cancelled"],
  Dispatched: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

const transitionPermissions = {
  "Pending->Approved": ["admin", "warehouse_manager"],
  "Pending->Cancelled": ["admin", "warehouse_manager"],
  "Approved->Allocated": ["admin", "warehouse_manager"],
  "Approved->Cancelled": ["admin", "warehouse_manager"],
  "Allocated->Dispatched": ["admin", "warehouse_manager"],
  "Allocated->Cancelled": ["admin", "warehouse_manager"],
  "Dispatched->Delivered": ["admin", "warehouse_manager"],
};

const getValidNextStatuses = (currentStatus, role) => {
  const transitions = allowedTransitions[currentStatus] || [];
  return transitions.filter(next => {
    const key = `${currentStatus}->${next}`;
    return (transitionPermissions[key] || []).includes(role);
  });
};

const WarehouseOrders = () => {
  const { user } = useSelector(state => state.auth);
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

  const openStatusDialog = (order) => {
    const validNext = getValidNextStatuses(order.status, user?.role);
    if (validNext.length === 0) {
      setError(`No status changes allowed from ${order.status} for your role.`);
      return;
    }
    setSelectedOrder(order);
    setNewStatus(validNext[0]);
    setStatusOpen(true);
  };

  const getActiveStep = (status) => Math.max(0, orderSteps.indexOf(status));

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
                    {["Order #", "Retailer", "Items", "Total", "Status", "Date", "Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: "#1a1a2e" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No orders yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map(o => {
                      const validNext = getValidNextStatuses(o.status, user?.role);
                      const canEdit = validNext.length > 0;
                      return (
                        <TableRow key={o._id} hover>
                          <TableCell><Chip label={o.orderNumber} size="small" /></TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>{o.retailer?.name}</Typography>
                          </TableCell>
                          <TableCell>{o.items?.length} item(s)</TableCell>
                          <TableCell>₹{o.totalAmount?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip label={o.status} size="small" color={statusColors[o.status] || "default"} />
                          </TableCell>
                          <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <IconButton size="small" color="info"
                              onClick={() => { setSelectedOrder(o); setViewOpen(true); }}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            {canEdit && (
                              <IconButton size="small" color="primary"
                                onClick={() => openStatusDialog(o)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={600}>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Card sx={{ mb: 3, p: 2, backgroundColor: "#f8f9fa", borderRadius: 2 }} elevation={0}>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>Fulfillment Progress</Typography>
                <Stepper activeStep={getActiveStep(selectedOrder.status)} alternativeLabel>
                  {orderSteps.map(label => (
                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                  ))}
                </Stepper>
              </Card>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  {[
                    { label: "Order Number", value: selectedOrder.orderNumber },
                    { label: "Status", value: selectedOrder.status },
                    { label: "Total", value: `₹${selectedOrder.totalAmount?.toLocaleString()}` },
                    { label: "Shipping Address", value: selectedOrder.shippingAddress || "—" },
                    { label: "Retailer", value: selectedOrder.retailer?.name },
                    { label: "Inventory Updated", value: selectedOrder.inventoryUpdated ? "✅ Yes" : "❌ No" },
                  ].map(item => (
                    <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid #f0f0f0" }}>
                      <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                      <Typography variant="body2" fontWeight={500}>{item.value}</Typography>
                    </Box>
                  ))}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>Items</Typography>
                  {selectedOrder.items?.map((item, i) => (
                    <Box key={i} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid #f0f0f0" }}>
                      <Typography variant="body2">{item.product?.name}</Typography>
                      <Typography variant="body2" fontWeight={500}>{item.quantity} × ₹{item.unitPrice}</Typography>
                    </Box>
                  ))}
                  {selectedOrder.statusHistory?.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} mb={1}>Status History</Typography>
                      {selectedOrder.statusHistory.map((h, i) => (
                        <Box key={i} sx={{ display: "flex", gap: 1, py: 0.5, borderBottom: "1px solid #f0f0f0" }}>
                          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>
                            {new Date(h.timestamp).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption">
                            <strong>{h.from}</strong> → <strong>{h.to}</strong> by {h.changedBy}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
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
          {selectedOrder && (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Current: <strong>{selectedOrder.status}</strong>
              </Typography>
              <FormControl size="small" fullWidth>
                <InputLabel>New Status</InputLabel>
                <Select value={newStatus} label="New Status"
                  onChange={(e) => setNewStatus(e.target.value)}>
                  {getValidNextStatuses(selectedOrder.status, user?.role).map(s => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
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

export default WarehouseOrders;

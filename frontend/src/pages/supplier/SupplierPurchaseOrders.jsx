import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, TextField,
  IconButton, Stepper, Step, StepLabel, Grid,
  Divider,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const statusColors = {
  Pending: "warning", Confirmed: "info", Shipped: "primary",
  Delivered: "success", Cancelled: "error",
};

const statusSteps = ["Pending", "Confirmed", "Shipped", "Delivered"];

const SupplierPurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [shipOpen, setShipOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shipForm, setShipForm] = useState({
    trackingNumber: "", courierName: "", expectedDeliveryDate: "",
  });

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/purchase-orders");
      setOrders(data.orders);
    } catch {
      setError("Failed to load purchase orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleAction = async (orderId, action, extra = {}) => {
    try {
      await API.put(`/purchase-orders/${orderId}/supplier-action`, { action, ...extra });
      setSuccess(`Order ${action} successfully!`);
      setViewOpen(false);
      setShipOpen(false);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed.");
    }
  };

  const getActiveStep = (status) => {
    const index = statusSteps.indexOf(status);
    return index === -1 ? 0 : index;
  };

  const pendingOrders = orders.filter(o => o.status === "Pending");
  const activeOrders = orders.filter(o => ["Confirmed", "Shipped"].includes(o.status));
  const completedOrders = orders.filter(o => o.status === "Delivered");

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Purchase Orders</Typography>
        <Typography variant="body2" color="text.secondary">
          Accept, ship and manage orders from warehouse
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {/* Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "New Orders", value: pendingOrders.length, color: "#ffb74d" },
          { label: "Active Orders", value: activeOrders.length, color: "#4fc3f7" },
          { label: "Completed", value: completedOrders.length, color: "#66bb6a" },
          { label: "Total Orders", value: orders.length, color: "#ce93d8" },
        ].map(item => (
          <Grid item xs={6} md={3} key={item.label}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" fontWeight="bold" color={item.color}>{item.value}</Typography>
                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* New Orders needing action */}
      {pendingOrders.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You have {pendingOrders.length} new order(s) waiting for your acceptance!
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableRow>
                    {["PO Number", "Items", "Total", "Status", "Expected Date", "Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: "#1a1a2e" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No purchase orders yet. Orders from warehouse will appear here.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map(o => (
                      <TableRow key={o._id} hover
                        sx={{ backgroundColor: o.status === "Pending" ? "#fff8e1" : "inherit" }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{o.poNumber}</Typography>
                          {o.status === "Pending" && (
                            <Chip label="Action Required" size="small" color="warning" sx={{ mt: 0.5, fontSize: 10 }} />
                          )}
                        </TableCell>
                        <TableCell>{o.items?.length} item(s)</TableCell>
                        <TableCell>₹{o.totalAmount?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip label={o.status} size="small" color={statusColors[o.status] || "default"} />
                        </TableCell>
                        <TableCell>
                          {o.expectedDeliveryDate
                            ? new Date(o.expectedDeliveryDate).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                            <IconButton size="small" color="info"
                              onClick={() => { setSelectedOrder(o); setViewOpen(true); }}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            {o.status === "Pending" && (
                              <>
                                <IconButton size="small" color="success" title="Accept Order"
                                  onClick={() => handleAction(o._id, "Confirmed")}>
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" title="Reject Order"
                                  onClick={() => handleAction(o._id, "Cancelled")}>
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </>
                            )}
                            {o.status === "Confirmed" && (
                              <Button size="small" variant="contained" startIcon={<LocalShippingIcon />}
                                onClick={() => { setSelectedOrder(o); setShipOpen(true); }}
                                sx={{ backgroundColor: "#4fc3f7", "&:hover": { backgroundColor: "#0288d1" }, fontSize: 11 }}>
                                Ship
                              </Button>
                            )}
                          </Box>
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

      {/* View Order Details Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={600}>Purchase Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              {/* Progress Stepper */}
              <Card sx={{ mb: 3, p: 2, backgroundColor: "#f8f9fa", borderRadius: 2 }} elevation={0}>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>Order Progress</Typography>
                <Stepper activeStep={getActiveStep(selectedOrder.status)} alternativeLabel>
                  {statusSteps.map(label => (
                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                  ))}
                </Stepper>
              </Card>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>Order Info</Typography>
                  {[
                    { label: "PO Number", value: selectedOrder.poNumber },
                    { label: "Status", value: selectedOrder.status },
                    { label: "Total Amount", value: `₹${selectedOrder.totalAmount?.toLocaleString()}` },
                    { label: "Expected Delivery", value: selectedOrder.expectedDeliveryDate ? new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString() : "—" },
                    { label: "Tracking Number", value: selectedOrder.trackingNumber || "—" },
                    { label: "Courier", value: selectedOrder.courierName || "—" },
                    { label: "Notes", value: selectedOrder.notes || "—" },
                  ].map(item => (
                    <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid #f0f0f0" }}>
                      <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                      <Typography variant="body2" fontWeight={500}>{item.value}</Typography>
                    </Box>
                  ))}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>Items to Supply</Typography>
                  {selectedOrder.items?.map((item, i) => (
                    <Box key={i} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid #f0f0f0" }}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{item.product?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">SKU: {item.product?.sku}</Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="body2" fontWeight={600}>Qty: {item.quantity}</Typography>
                        <Typography variant="caption" color="text.secondary">₹{item.unitPrice} each</Typography>
                      </Box>
                    </Box>
                  ))}
                  <Box sx={{ mt: 1, pt: 1, display: "flex", justifyContent: "space-between" }}>
                    <Typography fontWeight={600}>Total</Typography>
                    <Typography fontWeight={600}>₹{selectedOrder.totalAmount?.toLocaleString()}</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Action Buttons inside dialog */}
              {selectedOrder.status === "Pending" && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: "#fff8e1", borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600} mb={1}>Action Required</Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button fullWidth variant="contained" startIcon={<CheckCircleIcon />}
                      onClick={() => handleAction(selectedOrder._id, "Confirmed")}
                      sx={{ backgroundColor: "#66bb6a", "&:hover": { backgroundColor: "#388e3c" } }}>
                      Accept Order
                    </Button>
                    <Button fullWidth variant="outlined" color="error" startIcon={<CancelIcon />}
                      onClick={() => handleAction(selectedOrder._id, "Cancelled")}>
                      Reject Order
                    </Button>
                  </Box>
                </Box>
              )}

              {selectedOrder.status === "Confirmed" && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600} mb={1}>Ready to Ship?</Typography>
                  <Button fullWidth variant="contained" startIcon={<LocalShippingIcon />}
                    onClick={() => { setViewOpen(false); setShipOpen(true); }}
                    sx={{ backgroundColor: "#4fc3f7", "&:hover": { backgroundColor: "#0288d1" } }}>
                    Mark as Shipped
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

      {/* Ship Order Dialog */}
      <Dialog open={shipOpen} onClose={() => setShipOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={600}>Mark as Shipped</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enter shipment details for {selectedOrder?.poNumber}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Tracking Number" size="small" fullWidth
              value={shipForm.trackingNumber}
              onChange={(e) => setShipForm({ ...shipForm, trackingNumber: e.target.value })} />
            <TextField label="Courier Name" size="small" fullWidth
              placeholder="e.g. BlueDart, DTDC, FedEx"
              value={shipForm.courierName}
              onChange={(e) => setShipForm({ ...shipForm, courierName: e.target.value })} />
            <Typography variant="caption" color="text.secondary">Expected Delivery Date</Typography>
            <TextField size="small" fullWidth type="date"
              InputLabelProps={{ shrink: true }}
              value={shipForm.expectedDeliveryDate}
              onChange={(e) => setShipForm({ ...shipForm, expectedDeliveryDate: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShipOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<LocalShippingIcon />}
            onClick={() => handleAction(selectedOrder._id, "Shipped", shipForm)}
            sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" } }}>
            Confirm Shipment
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default SupplierPurchaseOrders;

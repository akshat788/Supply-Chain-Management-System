import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, FormControl,
  InputLabel, Select, MenuItem, IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

const statusColors = {
  Pending: "warning", Confirmed: "info", Shipped: "primary",
  Delivered: "success", Cancelled: "error",
};

const SupplierPurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/purchase-orders");
      console.log("SUPPLIER RESPONSE:", data);
      console.log("SUPPLIER ORDERS:", data.orders);
      setOrders(data.orders || []);
    } catch {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async () => {
    try {
      await API.put(`/purchase-orders/${selectedOrder._id}/status`, { status: newStatus });
      setSuccess(`Order marked as ${newStatus}`);
      setStatusOpen(false);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Purchase Orders</Typography>
        <Typography variant="body2" color="text.secondary">View and update your purchase orders</Typography>
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
                    {["PO Number", "Items", "Total", "Status", "Expected Date", "Actions"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: "#1a1a2e" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(orders || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No purchase orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (orders || []).map((o) => (
                      <TableRow key={o._id} hover>
                        <TableCell><Chip label={o.poNumber} size="small" /></TableCell>
                        <TableCell>{o.items?.length} item(s)</TableCell>
                        <TableCell>₹{o.totalAmount?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip label={o.status} size="small" color={statusColors[o.status] || "default"} />
                        </TableCell>
                        <TableCell>
                          {o.expectedDeliveryDate ? new Date(o.expectedDeliveryDate).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell>
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

      <Dialog open={statusOpen} onClose={() => setStatusOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={600}>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl size="small" fullWidth sx={{ mt: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select value={newStatus} label="Status" onChange={(e) => setNewStatus(e.target.value)}>
              {["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((s) => (
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

export default SupplierPurchaseOrders;

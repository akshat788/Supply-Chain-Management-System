import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, CircularProgress, MenuItem, Select,
  FormControl, InputLabel, IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

const statusColors = {
  Pending: "warning", Confirmed: "info", Shipped: "primary",
  Delivered: "success", Cancelled: "error",
};

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [form, setForm] = useState({
    supplier: "", expectedDeliveryDate: "", notes: "",
    items: [{ product: "", quantity: 1, unitPrice: 0 }],
  });

  const fetchData = async () => {
    try {
      const [poRes, supRes, prodRes] = await Promise.all([
        API.get("/purchase-orders"),
        API.get("/suppliers"),
        API.get("/products"),
      ]);
      console.log("PO RESPONSE:", poRes);
      console.log("PO DATA:", poRes.data);
      console.log("SUPPLIERS RESPONSE:", supRes);
      console.log("SUPPLIERS DATA:", supRes.data);
      console.log("SUPPLIERS DATA.DATA:", supRes.data.suppliers);
      console.log("PRODUCTS RESPONSE:", prodRes);
      console.log("PRODUCTS DATA:", prodRes.data);
      setOrders(poRes.data.orders || []);
      setSuppliers(supRes.data.suppliers || []);
      setProducts(prodRes.data.products || []);
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { product: "", quantity: 1, unitPrice: 0 }] });
  };

  const updateItem = (index, field, value) => {
    const items = [...form.items];
    items[index][field] = value;
    setForm({ ...form, items });
  };

  const handleSubmit = async () => {
    try {
      await API.post("/purchase-orders", form);
      setSuccess("Purchase order created successfully!");
      setOpen(false);
      setForm({ supplier: "", expectedDeliveryDate: "", notes: "", items: [{ product: "", quantity: 1, unitPrice: 0 }] });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create purchase order.");
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await API.put(`/purchase-orders/${selectedOrder._id}/status`, { status: newStatus });
      setSuccess(`Order marked as ${newStatus}`);
      setStatusOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    }
  };

  return (
    <Layout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Purchase Orders</Typography>
          <Typography variant="body2" color="text.secondary">Manage procurement from suppliers</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}
          sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" }, borderRadius: 2 }}>
          Create PO
        </Button>
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
                    {["PO Number", "Supplier", "Items", "Total", "Status", "Expected Date", "Actions"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: "#1a1a2e" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No purchase orders yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((o) => (
                      <TableRow key={o._id} hover>
                        <TableCell><Chip label={o.poNumber} size="small" /></TableCell>
                        <TableCell>{o.supplier?.name}</TableCell>
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

      {/* Create PO Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={600}>Create Purchase Order</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Supplier *</InputLabel>
              <Select value={form.supplier} label="Supplier *"
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
                {suppliers.map((s) => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">Expected Delivery Date</Typography>
            <TextField size="small" fullWidth type="date"
              InputLabelProps={{ shrink: true }}
              value={form.expectedDeliveryDate}
              onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })} />

            <Typography variant="subtitle2" fontWeight={600} mt={1}>Items</Typography>
            {form.items.map((item, index) => (
              <Box key={index} sx={{ display: "flex", gap: 2 }}>
                <FormControl size="small" sx={{ flex: 2 }}>
                  <InputLabel>Product</InputLabel>
                  <Select value={item.product} label="Product"
                    onChange={(e) => updateItem(index, "product", e.target.value)}>
                    {products.map((p) => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField label="Qty" size="small" type="number" sx={{ flex: 1 }}
                  value={item.quantity} onChange={(e) => updateItem(index, "quantity", Number(e.target.value))} />
                <TextField label="Unit Price" size="small" type="number" sx={{ flex: 1 }}
                  value={item.unitPrice} onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))} />
              </Box>
            ))}
            <Button onClick={addItem} size="small" sx={{ alignSelf: "flex-start" }}>+ Add Item</Button>

            <TextField label="Notes" size="small" fullWidth multiline rows={2}
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}
            sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" } }}>
            Create Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
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

export default PurchaseOrders;

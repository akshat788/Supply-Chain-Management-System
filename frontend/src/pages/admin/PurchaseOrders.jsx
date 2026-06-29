import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, CircularProgress, MenuItem, Select,
  FormControl, InputLabel, IconButton, Stepper, Step,
  StepLabel, Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";

const statusColors = {
  Pending: "warning", Confirmed: "info", Shipped: "primary",
  Delivered: "success", Cancelled: "error",
};

const statusSteps = ["Pending", "Confirmed", "Shipped", "Delivered"];

// Valid transitions per role
const allowedTransitions = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

const transitionPermissions = {
  "Pending->Confirmed": ["admin", "warehouse_manager"],
  "Pending->Cancelled": ["admin", "warehouse_manager"],
  "Confirmed->Shipped": ["admin", "supplier"],
  "Confirmed->Cancelled": ["admin", "supplier"],
  "Shipped->Delivered": ["admin", "warehouse_manager"],
};

const getValidNextStatuses = (currentStatus, role) => {
  const transitions = allowedTransitions[currentStatus] || [];
  return transitions.filter(next => {
    const key = `${currentStatus}->${next}`;
    return (transitionPermissions[key] || []).includes(role);
  });
};

const PurchaseOrders = () => {
  const { user } = useSelector(state => state.auth);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
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
      setOrders(poRes.data.orders);
      setSuppliers(supRes.data.suppliers);
      setProducts(prodRes.data.products);
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { product: "", quantity: 1, unitPrice: 0 }] });

  const updateItem = (index, field, value) => {
    const items = [...form.items];
    items[index][field] = value;
    setForm({ ...form, items });
  };

  const handleSubmit = async () => {
    if (!form.supplier) {
      setError("Supplier is required.");
      return;
    }
    if (form.items.some(item => !item.product || item.quantity <= 0 || item.unitPrice < 0)) {
      setError("All items must have a valid product, quantity > 0, and unit price >= 0.");
      return;
    }
    try {
      await API.post("/purchase-orders", form);
      setSuccess("Purchase order created!");
      setOpen(false);
      setForm({ supplier: "", expectedDeliveryDate: "", notes: "", items: [{ product: "", quantity: 1, unitPrice: 0 }] });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create PO.");
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

  const openStatusDialog = (order) => {
    const validNextStatuses = getValidNextStatuses(order.status, user?.role);
    if (validNextStatuses.length === 0) {
      setError(`No status changes allowed from ${order.status} for your role.`);
      return;
    }
    setSelectedOrder(order);
    setNewStatus(validNextStatuses[0]);
    setStatusOpen(true);
  };

  const getActiveStep = (status) => Math.max(0, statusSteps.indexOf(status));

  const getDeliveryDelay = (order) => {
    if (!order.expectedDeliveryDate) return null;
    const expected = new Date(order.expectedDeliveryDate);
    const actual = order.deliveredDate ? new Date(order.deliveredDate) : new Date();
    return Math.floor((actual - expected) / (1000 * 60 * 60 * 24));
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
                    {["PO Number", "Supplier", "Contact", "Items", "Total", "Status", "Expected Date", "Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: "#1a1a2e" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No purchase orders yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map(o => {
                      const delay = getDeliveryDelay(o);
                      const validNext = getValidNextStatuses(o.status, user?.role);
                      const canEdit = validNext.length > 0;
                      return (
                        <TableRow key={o._id} hover>
                          <TableCell><Chip label={o.poNumber} size="small" /></TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>{o.supplier?.name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {o.supplier?.contactPerson || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>{o.items?.length} item(s)</TableCell>
                          <TableCell>₹{o.totalAmount?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip label={o.status} size="small" color={statusColors[o.status] || "default"} />
                            {delay !== null && delay > 0 && o.status !== "Delivered" && o.status !== "Cancelled" && (
                              <Typography variant="caption" display="block" color="error">{delay}d overdue</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {o.expectedDeliveryDate ? (
                              <Box>
                                <Typography variant="caption">
                                  {new Date(o.expectedDeliveryDate).toLocaleDateString()}
                                </Typography>
                                {o.deliveredDate && (
                                  <Typography variant="caption" display="block"
                                    color={delay > 0 ? "error" : "success.main"}>
                                    {delay > 0 ? `+${delay}d late` : "On time ✅"}
                                  </Typography>
                                )}
                              </Box>
                            ) : "—"}
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" color="info"
                              onClick={() => { setSelectedOrder(o); setViewOpen(true); }}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            {canEdit && (
                              <IconButton size="small" color="primary" onClick={() => openStatusDialog(o)}>
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

      {/* View PO Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={600}>Purchase Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Card sx={{ mb: 3, p: 2, backgroundColor: "#f8f9fa", borderRadius: 2 }} elevation={0}>
                <Typography variant="subtitle2" fontWeight={600} mb={2}>Delivery Progress</Typography>
                <Stepper activeStep={getActiveStep(selectedOrder.status)} alternativeLabel>
                  {statusSteps.map(label => (
                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                  ))}
                </Stepper>
              </Card>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  {[
                    { label: "PO Number", value: selectedOrder.poNumber },
                    { label: "Status", value: selectedOrder.status },
                    { label: "Total", value: `₹${selectedOrder.totalAmount?.toLocaleString()}` },
                    { label: "Expected Delivery", value: selectedOrder.expectedDeliveryDate ? new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString() : "—" },
                    { label: "Delivered On", value: selectedOrder.deliveredDate ? new Date(selectedOrder.deliveredDate).toLocaleDateString() : "—" },
                    { label: "Tracking #", value: selectedOrder.trackingNumber || "—" },
                    { label: "Courier", value: selectedOrder.courierName || "—" },
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

                  {/* Audit Trail */}
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

      {/* Create PO Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={600}>Create Purchase Order</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Supplier *</InputLabel>
              <Select value={form.supplier} label="Supplier *"
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
                {suppliers.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">Expected Delivery Date</Typography>
            <TextField size="small" fullWidth type="date" InputLabelProps={{ shrink: true }}
              value={form.expectedDeliveryDate}
              onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })} />
            <Typography variant="subtitle2" fontWeight={600}>Items</Typography>
            {form.items.map((item, index) => (
              <Box key={index} sx={{ display: "flex", gap: 2 }}>
                <FormControl size="small" sx={{ flex: 2 }}>
                  <InputLabel>Product</InputLabel>
                  <Select value={item.product} label="Product"
                    onChange={(e) => updateItem(index, "product", e.target.value)}>
                    {products.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
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
    </Layout>
  );
};

export default PurchaseOrders;

import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, TextField,
  FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const InventoryTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    product: "", action: "Manual Adjustment",
    quantity: 1, type: "IN", reference: "", notes: "",
  });

  const fetchData = async () => {
    try {
      const [txRes, prodRes] = await Promise.all([
        API.get("/inventory-transactions"),
        API.get("/products"),
      ]);
      setTransactions(txRes.data.transactions);
      setProducts(prodRes.data.products);
    } catch {
      setError("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.product) {
      setError("Product is required.");
      return;
    }
    if (!form.quantity || form.quantity <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }
    try {
      await API.post("/inventory-transactions", form);
      setSuccess("Transaction recorded successfully!");
      setOpen(false);
      setForm({ product: "", action: "Manual Adjustment", quantity: 1, type: "IN", reference: "", notes: "" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record transaction.");
    }
  };

  const actionColors = {
    "PO Delivered": "success",
    "Retail Order": "error",
    "Manual Adjustment": "info",
    "Stock Transfer": "warning",
    "Damaged": "error",
    "Returned": "success",
  };

  return (
    <Layout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Inventory Transactions</Typography>
          <Typography variant="body2" color="text.secondary">Complete history of all stock movements</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}
          sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" }, borderRadius: 2 }}>
          Manual Adjustment
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {/* Summary Cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: "#e8f5e9" }}>
              <ArrowUpwardIcon sx={{ color: "#66bb6a" }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Total Stock In</Typography>
              <Typography variant="h5" fontWeight="bold" color="#66bb6a">
                +{transactions.filter(t => t.type === "IN").reduce((s, t) => s + t.quantity, 0)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: "#ffebee" }}>
              <ArrowDownwardIcon sx={{ color: "#ef5350" }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Total Stock Out</Typography>
              <Typography variant="h5" fontWeight="bold" color="#ef5350">
                -{transactions.filter(t => t.type === "OUT").reduce((s, t) => s + t.quantity, 0)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: "#e3f2fd" }}>
              <Typography variant="h6" color="#42a5f5">📋</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Total Transactions</Typography>
              <Typography variant="h5" fontWeight="bold" color="#42a5f5">{transactions.length}</Typography>
            </Box>
          </CardContent>
        </Card>
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
                    {["Date & Time", "Action", "Product", "SKU", "Quantity", "Type", "Reference", "Performed By"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: "#1a1a2e" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No transactions yet. They will appear automatically when POs are delivered or orders are processed.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map(tx => (
                      <TableRow key={tx._id} hover>
                        <TableCell>
                          <Typography variant="body2">{new Date(tx.createdAt).toLocaleDateString()}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(tx.createdAt).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={tx.action} size="small" color={actionColors[tx.action] || "default"} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{tx.product?.name}</TableCell>
                        <TableCell><Chip label={tx.product?.sku} size="small" variant="outlined" /></TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            {tx.type === "IN"
                              ? <ArrowUpwardIcon fontSize="small" sx={{ color: "#66bb6a" }} />
                              : <ArrowDownwardIcon fontSize="small" sx={{ color: "#ef5350" }} />
                            }
                            <Typography fontWeight={600} color={tx.type === "IN" ? "#66bb6a" : "#ef5350"}>
                              {tx.type === "IN" ? "+" : "-"}{tx.quantity}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={tx.type} size="small" color={tx.type === "IN" ? "success" : "error"} />
                        </TableCell>
                        <TableCell>{tx.reference || "—"}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{tx.performedBy?.name || "System"}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                            {tx.performedBy?.role?.replace("_", " ") || ""}
                          </Typography>
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

      {/* Manual Adjustment Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={600}>Manual Stock Adjustment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Product *</InputLabel>
              <Select value={form.product} label="Product *"
                onChange={(e) => setForm({ ...form, product: e.target.value })}>
                {products.map(p => <MenuItem key={p._id} value={p._id}>{p.name} — {p.sku}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Action *</InputLabel>
              <Select value={form.action} label="Action *"
                onChange={(e) => setForm({ ...form, action: e.target.value })}>
                {["Manual Adjustment", "Stock Transfer", "Damaged", "Returned"].map(a => (
                  <MenuItem key={a} value={a}>{a}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Type *</InputLabel>
              <Select value={form.type} label="Type *"
                onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <MenuItem value="IN">IN (Add Stock)</MenuItem>
                <MenuItem value="OUT">OUT (Remove Stock)</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Quantity *" size="small" fullWidth type="number"
              value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            <TextField label="Reference (optional)" size="small" fullWidth
              value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
            <TextField label="Notes" size="small" fullWidth multiline rows={2}
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}
            sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" } }}>
            Record Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default InventoryTransactions;

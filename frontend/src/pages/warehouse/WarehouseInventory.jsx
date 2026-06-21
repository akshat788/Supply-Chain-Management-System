import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Alert, CircularProgress, LinearProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, Button, TextField,
  IconButton, ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import WarningIcon from "@mui/icons-material/Warning";

const WarehouseInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState({});
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ availableStock: 0, minimumStockLevel: 0, warehouseLocation: "" });

  const fetchData = async () => {
    try {
      const [invRes, prodRes] = await Promise.all([
        API.get("/inventory"),
        API.get("/products"),
      ]);
      setInventory(invRes.data.inventory);
      setFiltered(invRes.data.inventory);
      const prodMap = {};
      prodRes.data.products.forEach(p => { prodMap[p._id] = p; });
      setProducts(prodMap);
    } catch {
      setError("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let result = inventory;
    if (filter === "low") result = inventory.filter(i => i.availableStock <= i.minimumStockLevel && i.availableStock > 0);
    else if (filter === "out") result = inventory.filter(i => i.availableStock === 0);
    else if (filter === "transit") result = inventory.filter(i => i.inTransitStock > 0);
    setFiltered(result);
  }, [filter, inventory]);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setForm({ availableStock: item.availableStock, minimumStockLevel: item.minimumStockLevel, warehouseLocation: item.warehouseLocation });
    setOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await API.put(`/inventory/${selectedItem._id}`, {
        availableStock: Number(form.availableStock),
        minimumStockLevel: Number(form.minimumStockLevel),
        warehouseLocation: form.warehouseLocation,
      });
      setSuccess("Inventory updated successfully!");
      setOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update inventory.");
    }
  };

  const getStockPct = (item) => Math.min(100, Math.round((item.availableStock / item.maximumStockLevel) * 100));

  const getInventoryValue = (item) => {
    const prod = products[item.product?._id];
    return prod ? item.availableStock * prod.costPrice : 0;
  };

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Inventory</Typography>
        <Typography variant="body2" color="text.secondary">Monitor and manage warehouse stock</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {/* Filter Buttons */}
      <ToggleButtonGroup value={filter} exclusive onChange={(e, val) => val && setFilter(val)} sx={{ mb: 3 }}>
        <ToggleButton value="all" size="small">All</ToggleButton>
        <ToggleButton value="low" size="small">Low Stock</ToggleButton>
        <ToggleButton value="out" size="small">Out of Stock</ToggleButton>
        <ToggleButton value="transit" size="small">In Transit</ToggleButton>
      </ToggleButtonGroup>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableRow>
                    {["Product", "SKU", "Stock Level", "Available", "Reserved", "In Transit", "Inv. Value", "Last Updated", "Status", "Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: "#1a1a2e" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No inventory items found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(item => {
                      const isLow = item.availableStock <= item.minimumStockLevel;
                      const isOut = item.availableStock === 0;
                      const pct = getStockPct(item);
                      const value = getInventoryValue(item);
                      return (
                        <TableRow key={item._id} hover sx={{ backgroundColor: isLow ? "#fff3e0" : "inherit" }}>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              {isLow && <WarningIcon fontSize="small" color="warning" />}
                              <Typography variant="body2" fontWeight={500}>{item.product?.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell><Chip label={item.product?.sku} size="small" /></TableCell>
                          <TableCell sx={{ minWidth: 160 }}>
                            <LinearProgress variant="determinate" value={pct}
                              sx={{ height: 8, borderRadius: 4, backgroundColor: "#f0f0f0",
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor: isOut ? "#ef5350" : isLow ? "#ffa726" : "#66bb6a",
                                  borderRadius: 4
                                }
                              }} />
                            <Typography variant="caption" color="text.secondary">
                              {item.availableStock}/{item.maximumStockLevel}
                            </Typography>
                          </TableCell>
                          <TableCell><Typography fontWeight={600} color={isLow ? "error" : "inherit"}>{item.availableStock}</Typography></TableCell>
                          <TableCell>{item.reservedStock}</TableCell>
                          <TableCell>{item.inTransitStock}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500} color="#42a5f5">
                              ₹{value.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(item.lastUpdated).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                              size="small" color={isOut ? "error" : isLow ? "warning" : "success"} />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" color="primary" onClick={() => handleEdit(item)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={600}>Update Stock</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Available Stock" size="small" fullWidth type="number"
              value={form.availableStock} onChange={(e) => setForm({ ...form, availableStock: e.target.value })} />
            <TextField label="Minimum Stock Level" size="small" fullWidth type="number"
              value={form.minimumStockLevel} onChange={(e) => setForm({ ...form, minimumStockLevel: e.target.value })} />
            <TextField label="Warehouse Location" size="small" fullWidth
              value={form.warehouseLocation} onChange={(e) => setForm({ ...form, warehouseLocation: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}
            sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" } }}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default WarehouseInventory;

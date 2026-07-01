import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, CircularProgress, MenuItem, Select,
  FormControl, InputLabel, IconButton, InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";

const categories = ["Electronics", "Fashion", "Food", "Pharmaceutical", "Furniture", "Other"];

const SupplierProducts = () => {
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState(querySearch);

  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [form, setForm] = useState({
    name: "", category: "Electronics", description: "",
    costPrice: "", sellingPrice: "", unit: "pcs",
  });

  const fetchData = async () => {
    try {
      const [prodRes, invRes] = await Promise.all([
        API.get("/products"),
        API.get("/inventory"),
      ]);
      setProducts(prodRes.data.products);
      setFiltered(prodRes.data.products);
      setInventory(invRes.data.inventory);
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let result = products;
    if (search) result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
    );
    if (categoryFilter !== "All") result = result.filter(p => p.category === categoryFilter);
    setFiltered(result);
  }, [search, categoryFilter, products]);

  const getStock = (productId) => {
    const inv = inventory.find(i => i.product?._id === productId);
    return inv ? inv.availableStock : null;
  };

  const getStockStatus = (stock) => {
    if (stock === null) return { label: "No Inventory", color: "default" };
    if (stock === 0) return { label: "Out of Stock", color: "error" };
    if (stock <= 50) return { label: "Low Stock", color: "warning" };
    return { label: "Active", color: "success" };
  };

  const handleOpen = (product = null) => {
    if (product) {
      setEditId(product._id);
      setForm({
        name: product.name || "",
        category: product.category || "Electronics",
        description: product.description || "",
        costPrice: product.costPrice || "",
        sellingPrice: product.sellingPrice || "",
        unit: product.unit || "pcs",
      });
    } else {
      setEditId(null);
      setForm({ name: "", category: "Electronics", description: "", costPrice: "", sellingPrice: "", unit: "pcs" });
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
      };
      if (editId) {
        await API.put(`/products/${editId}`, payload);
        setSuccess("Product updated successfully!");
      } else {
        await API.post("/products", payload);
        setSuccess("Product added successfully!");
      }
      setOpen(false);
      setEditId(null);
      setForm({ name: "", category: "Electronics", description: "", costPrice: "", sellingPrice: "", unit: "pcs" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product.");
    }
  };



  return (
    <Layout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Products</Typography>
          <Typography variant="body2" color="text.secondary">Manage your product catalogue</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}
          sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" }, borderRadius: 2 }}>
          Add Product
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {/* Search + Filter */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField placeholder="Search products..." size="small" sx={{ flex: 1, backgroundColor: "#fff" }}
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)}>
            <MenuItem value="All">All</MenuItem>
            {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
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
                    {["SKU", "Name", "Category", "Cost Price", "Selling Price", "Stock", "Status", "Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: "#1a1a2e" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(p => {
                      const stock = getStock(p._id);
                      const stockStatus = getStockStatus(stock);
                      return (
                        <TableRow key={p._id} hover>
                          <TableCell><Chip label={p.sku} size="small" /></TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{p.name}</TableCell>
                          <TableCell><Chip label={p.category} size="small" variant="outlined" /></TableCell>
                          <TableCell>₹{p.costPrice?.toLocaleString()}</TableCell>
                          <TableCell>₹{p.sellingPrice?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {stock !== null ? `${stock} ${p.unit}` : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={stockStatus.label} size="small" color={stockStatus.color} />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" color="primary" onClick={() => handleOpen(p)}>
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

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={600}>{editId ? "Edit Product" : "Add New Product"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Product Name *" size="small" fullWidth
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <FormControl size="small" fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={form.category} label="Category"
                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Description" size="small" fullWidth multiline rows={2}
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField label="Cost Price *" size="small" fullWidth type="number"
                value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
              <TextField label="Selling Price *" size="small" fullWidth type="number"
                value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
            </Box>
            <TextField label="Unit (pcs/kg/litre)" size="small" fullWidth
              value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}
            sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" } }}>
            {editId ? "Update Product" : "Add Product"}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default SupplierProducts;

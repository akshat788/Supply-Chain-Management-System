import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Card, CardContent, Typography, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Alert, CircularProgress,
  InputAdornment, FormControl, InputLabel, Select, MenuItem,
  LinearProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import WarningIcon from "@mui/icons-material/Warning";

const categories = ["All", "Electronics", "Fashion", "Food", "Pharmaceutical", "Furniture", "Other"];

const WarehouseProducts = () => {
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(querySearch);
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);

  useEffect(() => {
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
    fetchData();
  }, []);

  useEffect(() => {
    let result = products;
    if (search) result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
    );
    if (categoryFilter !== "All") result = result.filter(p => p.category === categoryFilter);
    setFiltered(result);
  }, [search, categoryFilter, products]);

  const getInventory = (productId) => {
    return inventory.find(i => i.product?._id === productId || i.product === productId);
  };

  const getStockPct = (inv) => {
    if (!inv) return 0;
    return Math.min(100, Math.round((inv.availableStock / inv.maximumStockLevel) * 100));
  };

  const getStockStatus = (inv) => {
    if (!inv) return { label: "No Inventory", color: "default" };
    if (inv.availableStock === 0) return { label: "Out of Stock", color: "error" };
    if (inv.availableStock <= inv.minimumStockLevel) return { label: "Low Stock", color: "warning" };
    return { label: "In Stock", color: "success" };
  };

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Products</Typography>
        <Typography variant="body2" color="text.secondary">
          View all products and their stock levels
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Search + Filter */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField placeholder="Search by name or SKU..." size="small"
          sx={{ flex: 1, backgroundColor: "#fff", borderRadius: 2 }}
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Category</InputLabel>
          <Select value={categoryFilter} label="Category"
            onChange={(e) => setCategoryFilter(e.target.value)}>
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
                    {["SKU", "Name", "Category", "Cost Price", "Selling Price", "Stock Level", "Available", "Status"].map(h => (
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
                      const inv = getInventory(p._id);
                      const pct = getStockPct(inv);
                      const stockStatus = getStockStatus(inv);
                      const isLow = inv && inv.availableStock <= inv.minimumStockLevel;
                      return (
                        <TableRow key={p._id} hover
                          sx={{ backgroundColor: isLow ? "#fff3e0" : "inherit" }}>
                          <TableCell><Chip label={p.sku} size="small" /></TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              {isLow && <WarningIcon fontSize="small" color="warning" />}
                              <Typography variant="body2" fontWeight={500}>{p.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={p.category} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>₹{p.costPrice?.toLocaleString()}</TableCell>
                          <TableCell>₹{p.sellingPrice?.toLocaleString()}</TableCell>
                          <TableCell sx={{ minWidth: 150 }}>
                            {inv ? (
                              <Box>
                                <LinearProgress variant="determinate" value={pct}
                                  sx={{ height: 8, borderRadius: 4, backgroundColor: "#f0f0f0",
                                    "& .MuiLinearProgress-bar": {
                                      backgroundColor: inv.availableStock === 0 ? "#ef5350" :
                                        isLow ? "#ffa726" : "#66bb6a",
                                      borderRadius: 4,
                                    }
                                  }} />
                                <Typography variant="caption" color="text.secondary">
                                  {inv.availableStock}/{inv.maximumStockLevel}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary">—</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}
                              color={inv?.availableStock === 0 ? "error" : isLow ? "#ffa726" : "inherit"}>
                              {inv ? `${inv.availableStock} ${p.unit}` : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={stockStatus.label} size="small" color={stockStatus.color} />
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
    </Layout>
  );
};

export default WarehouseProducts;

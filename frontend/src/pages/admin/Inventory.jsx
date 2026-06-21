import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Alert, CircularProgress, LinearProgress, Switch,
  FormControlLabel, TextField, InputAdornment,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import SearchIcon from "@mui/icons-material/Search";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
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
    fetchData();
  }, []);

  useEffect(() => {
    let result = inventory;
    if (lowStockOnly) result = result.filter(i => i.availableStock <= i.minimumStockLevel);
    if (search) result = result.filter(i => i.product?.name?.toLowerCase().includes(search.toLowerCase()) || i.product?.sku?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [lowStockOnly, search, inventory]);

  const getStockPct = (item) => Math.min(100, Math.round((item.availableStock / item.maximumStockLevel) * 100));

  const getInventoryValue = (item) => {
    const prod = products[item.product?._id];
    return prod ? item.availableStock * prod.costPrice : 0;
  };

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Inventory</Typography>
        <Typography variant="body2" color="text.secondary">Track stock levels across all products</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <TextField placeholder="Search by product or SKU..." size="small"
          sx={{ flex: 1, backgroundColor: "#fff", borderRadius: 2 }}
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
        <FormControlLabel
          control={<Switch checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} color="error" />}
          label={<Typography variant="body2">Show Low Stock Only</Typography>} />
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
                    {["Product", "SKU", "Stock Level", "Available", "Reserved", "In Transit", "Inv. Value", "Last Updated", "Status"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: "#1a1a2e" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No inventory data found.
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
                          <TableCell sx={{ minWidth: 150 }}>
                            <Box>
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
                            </Box>
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
                            <Chip
                              label={isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                              size="small"
                              color={isOut ? "error" : isLow ? "warning" : "success"}
                            />
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

export default Inventory;

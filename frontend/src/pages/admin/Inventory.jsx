import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Alert, CircularProgress,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await API.get("/inventory");
        setInventory(data.inventory);
      } catch {
        setError("Failed to load inventory.");
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Inventory</Typography>
        <Typography variant="body2" color="text.secondary">Track stock levels across all products</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableRow>
                    {["Product", "SKU", "Category", "Available", "Reserved", "In Transit", "Location", "Status"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: "#1a1a2e" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No inventory data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    inventory.map((item) => {
                      const isLow = item.availableStock <= item.minimumStockLevel;
                      return (
                        <TableRow key={item._id} hover sx={{ backgroundColor: isLow ? "#fff3e0" : "inherit" }}>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              {isLow && <WarningIcon fontSize="small" color="warning" />}
                              {item.product?.name}
                            </Box>
                          </TableCell>
                          <TableCell><Chip label={item.product?.sku} size="small" /></TableCell>
                          <TableCell>{item.product?.category}</TableCell>
                          <TableCell><Typography fontWeight={600} color={isLow ? "error" : "inherit"}>{item.availableStock}</Typography></TableCell>
                          <TableCell>{item.reservedStock}</TableCell>
                          <TableCell>{item.inTransitStock}</TableCell>
                          <TableCell>{item.warehouseLocation}</TableCell>
                          <TableCell>
                            <Chip
                              label={isLow ? "Low Stock" : "In Stock"}
                              size="small"
                              color={isLow ? "error" : "success"}
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

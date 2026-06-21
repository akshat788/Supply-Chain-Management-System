import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Grid, Card, CardContent, Typography,
  Chip, CircularProgress, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";

const statusColors = {
  Pending: "warning", Confirmed: "info", Shipped: "primary",
  Delivered: "success", Cancelled: "error",
};

const SupplierDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/purchase-orders");
        console.log("SUPPLIER RESPONSE:", data);
        console.log("SUPPLIER ORDERS:", data.orders);
        setOrders(data.orders || []);
      } catch {
        setError("Failed to load purchase orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const pending = (orders || []).filter(
    (o) => o.status === "Pending"
  ).length;

  const delivered = (orders || []).filter(
    (o) => o.status === "Delivered"
  ).length;

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a1a2e">
          Welcome, {user?.name} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your purchase orders and deliveries.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Orders</Typography>
                  <Typography variant="h4" fontWeight="bold" color="#4fc3f7">{orders.length}</Typography>
                </Box>
                <LocalShippingIcon sx={{ fontSize: 40, color: "#4fc3f7" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Pending Orders</Typography>
                  <Typography variant="h4" fontWeight="bold" color="#ffb74d">{pending}</Typography>
                </Box>
                <PendingIcon sx={{ fontSize: 40, color: "#ffb74d" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Delivered</Typography>
                  <Typography variant="h4" fontWeight="bold" color="#81c784">{delivered}</Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: "#81c784" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>Purchase Orders</Typography>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableRow>
                    {["PO Number", "Items", "Total Amount", "Status", "Expected Date"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: "#1a1a2e" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(orders || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No purchase orders yet.
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
                      </TableRow>
                    ))
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

export default SupplierDashboard;

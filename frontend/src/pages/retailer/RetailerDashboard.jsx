import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import { getCleanName } from "../../utils/sanitize";
import {
  Box, Grid, Card, CardContent, Typography, Button,
  Chip, CircularProgress, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const statusColors = {
  Pending: "warning", Approved: "info", Allocated: "secondary",
  Dispatched: "primary", Delivered: "success", Cancelled: "error",
};

const RetailerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders/my-orders");
        setOrders(data.orders);
      } catch {
        setError("Failed to load your orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const totalSpending = orders
    .filter(o => o.status !== "Cancelled")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const pendingCount = orders.filter(o => o.status === "Pending").length;
  const deliveredCount = orders.filter(o => o.status === "Delivered").length;

  const lastDelivery = orders
    .filter(o => o.status === "Delivered")
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

  const avgOrderValue = orders.length > 0
    ? Math.round(orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / orders.length)
    : 0;

  const uniqueProducts = new Set(
    orders.flatMap(o => o.items?.map(i => i.product?._id || i.product) || [])
  ).size;

  const recentActivity = orders.slice(0, 5).map(o => ({
    text: `Order ${o.orderNumber} — ${o.status}`,
    color: statusColors[o.status] === "success" ? "#66bb6a" :
           statusColors[o.status] === "warning" ? "#ffb74d" : "#4fc3f7",
    time: new Date(o.createdAt).toLocaleDateString(),
  }));

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ fontFamily: "'Outfit', sans-serif" }}>
          Welcome, {getCleanName(user)} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {user?.organization || "Manage your orders and track deliveries."}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Main Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>Total Orders</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#06b6d4" sx={{ mt: 0.5 }}>{orders.length}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: "12px", backgroundColor: "#06b6d415", color: "#06b6d4" }}>
                  <ShoppingCartIcon sx={{ fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>Pending</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#f59e0b" sx={{ mt: 0.5 }}>{pendingCount}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: "12px", backgroundColor: "#f59e0b15", color: "#f59e0b" }}>
                  <PendingIcon sx={{ fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>Delivered</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#10b981" sx={{ mt: 0.5 }}>{deliveredCount}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: "12px", backgroundColor: "#10b98115", color: "#10b981" }}>
                  <CheckCircleIcon sx={{ fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>Total Spending</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#10b981" sx={{ mt: 0.5 }}>
                    ₹{totalSpending.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: "12px", backgroundColor: "#10b98115", color: "#10b981" }}>
                  <AttachMoneyIcon sx={{ fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Quick Stats</Typography>
              {[
                { label: "Products Purchased", value: uniqueProducts },
                { label: "Average Order Value", value: `₹${avgOrderValue.toLocaleString()}` },
                { label: "Last Delivery", value: lastDelivery ? new Date(lastDelivery.updatedAt).toLocaleDateString() : "None yet" },
              ].map(item => (
                <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", py: 1.5, borderBottom: "1px solid #f1f5f9" }}>
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card sx={{ height: "100%", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.02)" }}>
            <CardContent sx={{ pb: "16px !important" }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Recent Activity</Typography>
              {orders.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No activity yet.</Typography>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 220, overflowY: "auto", backgroundColor: "transparent" }}>
                  <Table size="small">
                    <TableBody>
                      {orders.slice(0, 5).map((order) => (
                        <TableRow key={order._id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell sx={{ borderBottom: "1px solid #f1f5f9", pl: 0, py: 1 }}>
                            <Typography variant="body2" fontWeight={700} color="#0f172a">
                              Order
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "10.5px" }} noWrap>
                              {order.orderNumber}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 1 }}>
                            <Chip label={order.status} size="small" color={statusColors[order.status] || "default"} sx={{ height: 20, fontSize: "11px", fontWeight: 700 }} />
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: "1px solid #f1f5f9", pr: 0, py: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Last Delivery */}
        <Grid size={{ xs: 12, md: 12, lg: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Last Delivery</Typography>
              {lastDelivery ? (
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                    <LocalShippingIcon sx={{ color: "#10b981" }} />
                    <Typography variant="body1" fontWeight={600} color="#10b981">Delivered</Typography>
                  </Box>
                  {[
                    { label: "Order #", value: lastDelivery.orderNumber },
                    { label: "Items", value: `${lastDelivery.items?.length} item(s)` },
                    { label: "Amount", value: `₹${lastDelivery.totalAmount?.toLocaleString()}` },
                    { label: "Date", value: new Date(lastDelivery.updatedAt).toLocaleDateString() },
                  ].map(item => (
                    <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", py: 1, borderBottom: "1px solid #f1f5f9" }}>
                      <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                      <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <LocalShippingIcon sx={{ fontSize: 40, color: "#cbd5e1" }} />
                  <Typography variant="body2" color="text.secondary" mt={1}>No deliveries yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Orders Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
            <Typography variant="h6" fontWeight={600}>Recent Orders</Typography>
            <Button variant="contained" startIcon={<AddIcon />}
              onClick={() => navigate("/retailer/products")}
              sx={{ backgroundColor: "secondary.main", "&:hover": { backgroundColor: "secondary.dark" } }}>
              Shop Now
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                  <TableRow>
                    {["Order #", "Items", "Total", "Status", "Date"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No orders yet. Start shopping!
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.slice(0, 5).map(order => (
                      <TableRow key={order._id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{order.orderNumber}</TableCell>
                        <TableCell>{order.items?.length} item(s)</TableCell>
                        <TableCell>₹{order.totalAmount?.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip label={order.status} size="small" color={statusColors[order.status] || "default"} />
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
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

export default RetailerDashboard;

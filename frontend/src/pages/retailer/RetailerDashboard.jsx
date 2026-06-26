import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../../components/Layout";
import API from "../../api/axios";
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
        <Typography variant="h5" fontWeight="bold" color="#1a1a2e">
          Welcome, {user?.name} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.organization || "Manage your orders and track deliveries."}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Main Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Orders</Typography>
                  <Typography variant="h4" fontWeight="bold" color="#4fc3f7">{orders.length}</Typography>
                </Box>
                <ShoppingCartIcon sx={{ fontSize: { xs: 28, sm: 36 }, color: "#4fc3f7" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Pending</Typography>
                  <Typography variant="h4" fontWeight="bold" color="#ffb74d">{pendingCount}</Typography>
                </Box>
                <PendingIcon sx={{ fontSize: { xs: 28, sm: 36 }, color: "#ffb74d" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Delivered</Typography>
                  <Typography variant="h4" fontWeight="bold" color="#81c784">{deliveredCount}</Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: { xs: 28, sm: 36 }, color: "#81c784" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Spending</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#66bb6a">
                    ₹{totalSpending.toLocaleString()}
                  </Typography>
                </Box>
                <AttachMoneyIcon sx={{ fontSize: { xs: 28, sm: 36 }, color: "#66bb6a" }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Quick Stats</Typography>
              {[
                { label: "Products Purchased", value: uniqueProducts },
                { label: "Average Order Value", value: `₹${avgOrderValue.toLocaleString()}` },
                { label: "Last Delivery", value: lastDelivery ? new Date(lastDelivery.updatedAt).toLocaleDateString() : "None yet" },
              ].map(item => (
                <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", py: 1, borderBottom: "1px solid #f0f0f0" }}>
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Recent Activity</Typography>
              {recentActivity.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No activity yet.</Typography>
              ) : (
                recentActivity.map((item, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 1, borderBottom: "1px solid #f0f0f0" }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: item.color, mt: 0.8, flexShrink: 0 }} />
                    <Box>
                      <Typography variant="body2">{item.text}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.time}</Typography>
                    </Box>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Last Delivery */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Last Delivery</Typography>
              {lastDelivery ? (
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <LocalShippingIcon sx={{ color: "#66bb6a" }} />
                    <Typography variant="body1" fontWeight={600} color="#66bb6a">Delivered</Typography>
                  </Box>
                  {[
                    { label: "Order #", value: lastDelivery.orderNumber },
                    { label: "Items", value: `${lastDelivery.items?.length} item(s)` },
                    { label: "Amount", value: `₹${lastDelivery.totalAmount?.toLocaleString()}` },
                    { label: "Date", value: new Date(lastDelivery.updatedAt).toLocaleDateString() },
                  ].map(item => (
                    <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                      <Typography variant="body2" fontWeight={500}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <LocalShippingIcon sx={{ fontSize: 48, color: "#e0e0e0" }} />
                  <Typography variant="body2" color="text.secondary" mt={1}>No deliveries yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Orders Table */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>Recent Orders</Typography>
            <Button variant="contained" startIcon={<AddIcon />}
              onClick={() => navigate("/retailer/products")}
              sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" }, borderRadius: 2 }}>
              Shop Now
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
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
                        <TableCell>{order.orderNumber}</TableCell>
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

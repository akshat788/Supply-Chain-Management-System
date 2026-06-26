import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Grid, Card, CardContent, Typography,
  Chip, CircularProgress, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  LinearProgress,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CategoryIcon from "@mui/icons-material/Category";
import StarIcon from "@mui/icons-material/Star";
import ScheduleIcon from "@mui/icons-material/Schedule";

const statusColors = {
  Pending: "warning", Confirmed: "info", Shipped: "primary",
  Delivered: "success", Cancelled: "error",
};

const SupplierDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [poRes, prodRes, supRes] = await Promise.all([
          API.get("/purchase-orders"),
          API.get("/products"),
          API.get("/suppliers"),
        ]);
        setOrders(poRes.data.orders);
        setProducts(prodRes.data.products);
        setSuppliers(supRes.data.suppliers);
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pending = orders.filter(o => o.status === "Pending").length;
  const delivered = orders.filter(o => o.status === "Delivered").length;
  const active = orders.filter(o => ["Confirmed", "Shipped"].includes(o.status)).length;
  const totalRevenue = orders
    .filter(o => o.status === "Delivered")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Upcoming deliveries this week
  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcoming = orders.filter(o => {
    if (!o.expectedDeliveryDate || o.status === "Delivered") return false;
    const d = new Date(o.expectedDeliveryDate);
    return d >= now && d <= weekLater;
  }).length;

  // Find supplier profile
  const supplierProfile = suppliers.find(s =>
    s.email?.toLowerCase() === user?.email?.toLowerCase() ||
    s.name?.toLowerCase() === user?.organization?.toLowerCase()
  );
  const performanceScore = supplierProfile?.performanceScore || 100;

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a1a2e">
          Welcome, {user?.name} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.organization || "Manage your orders and shipments"}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>
      ) : (
        <>
          {/* Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                      <Typography variant="h5" fontWeight="bold" color="#66bb6a">
                        ₹{totalRevenue.toLocaleString()}
                      </Typography>
                    </Box>
                    <AttachMoneyIcon sx={{ fontSize: 36, color: "#66bb6a" }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Products Listed</Typography>
                      <Typography variant="h4" fontWeight="bold" color="#4fc3f7">{products.length}</Typography>
                    </Box>
                    <CategoryIcon sx={{ fontSize: 36, color: "#4fc3f7" }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Active POs</Typography>
                      <Typography variant="h4" fontWeight="bold" color="#ffb74d">{active}</Typography>
                    </Box>
                    <LocalShippingIcon sx={{ fontSize: 36, color: "#ffb74d" }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Due This Week</Typography>
                      <Typography variant="h4" fontWeight="bold" color="#ce93d8">{upcoming}</Typography>
                    </Box>
                    <ScheduleIcon sx={{ fontSize: 36, color: "#ce93d8" }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Performance Rating */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Performance Rating</Typography>
                  <Box sx={{ textAlign: "center", py: 2 }}>
                    <StarIcon sx={{ fontSize: 48, color: "#ffa726" }} />
                    <Typography variant="h3" fontWeight="bold" color="#1a1a2e">{performanceScore}%</Typography>
                    <Chip label={performanceScore >= 90 ? "Excellent" : performanceScore >= 70 ? "Good" : "Needs Improvement"}
                      color={performanceScore >= 90 ? "success" : performanceScore >= 70 ? "warning" : "error"}
                      sx={{ mt: 1 }} />
                  </Box>
                  <LinearProgress variant="determinate" value={performanceScore}
                    sx={{ height: 10, borderRadius: 5, mt: 1,
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: performanceScore >= 90 ? "#66bb6a" : performanceScore >= 70 ? "#ffa726" : "#ef5350"
                      }
                    }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                    {[
                      { label: "Pending", value: pending, color: "#ffb74d" },
                      { label: "Active", value: active, color: "#4fc3f7" },
                      { label: "Delivered", value: delivered, color: "#66bb6a" },
                    ].map(item => (
                      <Box key={item.label} sx={{ textAlign: "center" }}>
                        <Typography variant="h5" fontWeight="bold" color={item.color}>{item.value}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Recent Purchase Orders</Typography>
                  {orders.length === 0 ? (
                    <Typography color="text.secondary">No purchase orders yet.</Typography>
                  ) : (
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small">
                        <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                          <TableRow>
                            {["PO Number", "Items", "Total", "Status", "Date"].map(h => (
                              <TableCell key={h} sx={{ fontWeight: 600 }}>{h}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {orders.slice(0, 5).map(o => (
                            <TableRow key={o._id} hover>
                              <TableCell>{o.poNumber}</TableCell>
                              <TableCell>{o.items?.length} item(s)</TableCell>
                              <TableCell>₹{o.totalAmount?.toLocaleString()}</TableCell>
                              <TableCell>
                                <Chip label={o.status} size="small" color={statusColors[o.status] || "default"} />
                              </TableCell>
                              <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Layout>
  );
};

export default SupplierDashboard;

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import { getCleanName } from "../../utils/sanitize";
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
        <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ fontFamily: "'Outfit', sans-serif" }}>
          Welcome, {getCleanName(user)} 👋
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
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>Total Revenue</Typography>
                      <Typography variant="h5" fontWeight="bold" color="#10b981" sx={{ mt: 0.5 }}>
                        ₹{totalRevenue.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: "12px", backgroundColor: "#10b98115", color: "#10b981" }}>
                      <AttachMoneyIcon sx={{ fontSize: 28 }} />
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
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>Products Listed</Typography>
                      <Typography variant="h5" fontWeight="bold" color="#4f46e5" sx={{ mt: 0.5 }}>{products.length}</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: "12px", backgroundColor: "#4f46e515", color: "#4f46e5" }}>
                      <CategoryIcon sx={{ fontSize: 28 }} />
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
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>Active POs</Typography>
                      <Typography variant="h5" fontWeight="bold" color="#f59e0b" sx={{ mt: 0.5 }}>{active}</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: "12px", backgroundColor: "#f59e0b15", color: "#f59e0b" }}>
                      <LocalShippingIcon sx={{ fontSize: 28 }} />
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
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>Due This Week</Typography>
                      <Typography variant="h5" fontWeight="bold" color="#818cf8" sx={{ mt: 0.5 }}>{upcoming}</Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: "12px", backgroundColor: "#818cf815", color: "#818cf8" }}>
                      <ScheduleIcon sx={{ fontSize: 28 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Performance Rating */}
            <Grid size={{ xs: 12, md: 5, lg: 4 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Performance Rating</Typography>
                  <Box sx={{ textAlign: "center", py: 2 }}>
                    <StarIcon sx={{ fontSize: 40, color: "#f59e0b" }} />
                    <Typography variant="h4" fontWeight="bold" color="text.primary">{performanceScore}%</Typography>
                    <Chip label={performanceScore >= 90 ? "Excellent" : performanceScore >= 70 ? "Good" : "Needs Improvement"}
                      color={performanceScore >= 90 ? "success" : performanceScore >= 70 ? "warning" : "error"}
                      sx={{ mt: 1.5 }} />
                  </Box>
                  <LinearProgress variant="determinate" value={performanceScore}
                    sx={{ height: 8, borderRadius: 5, mt: 1, backgroundColor: "#f1f5f9",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: performanceScore >= 90 ? "#10b981" : performanceScore >= 70 ? "#f59e0b" : "#ef4444"
                      }
                    }} />
                  <Box sx={{ display: "flex", justifyContent: "space-around", mt: 3 }}>
                    {[
                      { label: "Pending", value: pending, color: "#f59e0b" },
                      { label: "Active", value: active, color: "#06b6d4" },
                      { label: "Delivered", value: delivered, color: "#10b981" },
                    ].map(item => (
                      <Box key={item.label} sx={{ textAlign: "center" }}>
                        <Typography variant="h6" fontWeight="bold" color={item.color}>{item.value}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Purchase Orders */}
            <Grid size={{ xs: 12, md: 7, lg: 8 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Recent Purchase Orders</Typography>
                  {orders.length === 0 ? (
                    <Typography color="text.secondary">No purchase orders yet.</Typography>
                  ) : (
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small">
                        <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                          <TableRow>
                            {["PO Number", "Items", "Total", "Status", "Date"].map(h => (
                              <TableCell key={h} sx={{ fontWeight: 600 }}>{h}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {orders.slice(0, 5).map(o => (
                            <TableRow key={o._id} hover>
                              <TableCell sx={{ fontWeight: 500 }}>{o.poNumber}</TableCell>
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

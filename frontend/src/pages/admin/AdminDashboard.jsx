import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Grid, Card, CardContent, Typography,
  CircularProgress, Alert, Chip, LinearProgress,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import WarningIcon from "@mui/icons-material/Warning";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CategoryIcon from "@mui/icons-material/Category";

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%" }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="body2" color="text.secondary" mb={0.5}>{title}</Typography>
          <Typography variant="h4" fontWeight="bold" color={color || "#1a1a2e"}>{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
        <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: `${color}15` || "#1a1a2e15", color: color || "#1a1a2e" }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashRes, invRes] = await Promise.all([
          API.get("/analytics/dashboard"),
          API.get("/analytics/inventory"),
        ]);
        setStats(dashRes.data);
        setInventory(invRes.data);
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getStatusColor = (status) => {
    const map = { Pending: "warning", Confirmed: "info", Shipped: "primary", Delivered: "success", Cancelled: "error", Approved: "info", Dispatched: "primary" };
    return map[status] || "default";
  };

  const healthyStock = stats ? stats.counts.totalProducts - stats.counts.lowStockItems : 0;
  const healthPct = stats?.counts?.totalProducts > 0
    ? Math.round((healthyStock / stats.counts.totalProducts) * 100) : 0;

  if (loading) return <Layout><Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box></Layout>;

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Welcome back, {user?.name} 👋</Typography>
        <Typography variant="body2" color="text.secondary">Here's what's happening in your supply chain today.</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {stats && (
        <>
          {/* Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total Suppliers" value={stats.counts.totalSuppliers} icon={<LocalShippingIcon />} color="#4fc3f7" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total Products" value={stats.counts.totalProducts} icon={<InventoryIcon />} color="#81c784" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Total Orders" value={stats.counts.totalOrders} icon={<ShoppingCartIcon />} color="#ce93d8" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Low Stock Items" value={stats.counts.lowStockItems} icon={<WarningIcon />} color="#ef5350" subtitle="Needs attention" />
            </Grid>
          </Grid>

          {/* Financials */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <StatCard title="Total Revenue" icon={<AttachMoneyIcon />} color="#66bb6a" value={`₹${stats.financials.totalRevenue.toLocaleString()}`} subtitle="From delivered orders" />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard title="Procurement Cost" icon={<AttachMoneyIcon />} color="#ffa726" value={`₹${stats.financials.totalProcurementCost.toLocaleString()}`} subtitle="Total purchase orders" />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard title="Inventory Value" icon={<AttachMoneyIcon />} color="#42a5f5" value={`₹${stats.financials.totalInventoryValue.toLocaleString()}`} subtitle="Current stock value" />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Order Status Overview */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Order Status Overview</Typography>
                  {stats.orderStatusBreakdown.length === 0 ? (
                    <Typography color="text.secondary">No orders yet.</Typography>
                  ) : (
                    stats.orderStatusBreakdown.map((s) => (
                      <Box key={s._id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1, borderBottom: "1px solid #f0f0f0" }}>
                        <Chip label={s._id} size="small" color={getStatusColor(s._id)} />
                        <Typography fontWeight={600}>{s.count}</Typography>
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Inventory Health */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Inventory Health</Typography>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Healthy Stock</Typography>
                      <Typography variant="body2" fontWeight={600} color="#66bb6a">{healthPct}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={healthPct}
                      sx={{ height: 10, borderRadius: 5, backgroundColor: "#ffcdd2", "& .MuiLinearProgress-bar": { backgroundColor: "#66bb6a", borderRadius: 5 } }} />
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Box sx={{ textAlign: "center", p: 2, borderRadius: 2, backgroundColor: "#e8f5e9", flex: 1, mr: 1 }}>
                      <Typography variant="h5" fontWeight="bold" color="#66bb6a">{healthyStock}</Typography>
                      <Typography variant="caption" color="text.secondary">Healthy</Typography>
                    </Box>
                    <Box sx={{ textAlign: "center", p: 2, borderRadius: 2, backgroundColor: "#ffebee", flex: 1 }}>
                      <Typography variant="h5" fontWeight="bold" color="#ef5350">{stats.counts.lowStockItems}</Typography>
                      <Typography variant="caption" color="text.secondary">Low Stock</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activity Feed */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Recent Activity</Typography>
                  {[
                    ...stats.recentOrders.slice(0, 2).map(o => ({ text: `Order ${o.orderNumber} — ${o.status}`, color: "#ce93d8", time: new Date(o.createdAt).toLocaleDateString() })),
                    ...stats.recentPurchaseOrders.slice(0, 2).map(o => ({ text: `PO ${o.poNumber} — ${o.status}`, color: "#4fc3f7", time: new Date(o.createdAt).toLocaleDateString() })),
                    ...stats.topSuppliers.slice(0, 1).map(s => ({ text: `Supplier ${s.name} — Score ${s.performanceScore}%`, color: "#81c784", time: "Active" })),
                  ].slice(0, 5).map((item, i) => (
                    <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 1, borderBottom: "1px solid #f0f0f0" }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: item.color, mt: 0.8, flexShrink: 0 }} />
                      <Box>
                        <Typography variant="body2">{item.text}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.time}</Typography>
                      </Box>
                    </Box>
                  ))}
                  {stats.recentOrders.length === 0 && stats.recentPurchaseOrders.length === 0 && (
                    <Typography color="text.secondary" variant="body2">No recent activity.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Orders + Top Suppliers */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Recent Orders</Typography>
                  {stats.recentOrders.length === 0 ? (
                    <Typography color="text.secondary">No orders yet.</Typography>
                  ) : (
                    stats.recentOrders.map((order) => (
                      <Box key={order._id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1, borderBottom: "1px solid #f0f0f0" }}>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>{order.orderNumber}</Typography>
                          <Typography variant="caption" color="text.secondary">{order.retailer?.name || "Unknown"}</Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Chip label={order.status} size="small" color={getStatusColor(order.status)} />
                          <Typography variant="caption" display="block" color="text.secondary">₹{order.totalAmount?.toLocaleString()}</Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Top Suppliers</Typography>
                  {stats.topSuppliers.length === 0 ? (
                    <Typography color="text.secondary">No suppliers yet.</Typography>
                  ) : (
                    stats.topSuppliers.map((supplier) => (
                      <Box key={supplier._id} sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{supplier.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{supplier.supplierCode}</Typography>
                          </Box>
                          <Chip label={`${supplier.performanceScore}%`} size="small"
                            color={supplier.performanceScore >= 90 ? "success" : supplier.performanceScore >= 70 ? "warning" : "error"} />
                        </Box>
                        <LinearProgress variant="determinate" value={supplier.performanceScore}
                          sx={{ height: 6, borderRadius: 3, backgroundColor: "#f0f0f0",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: supplier.performanceScore >= 90 ? "#66bb6a" : supplier.performanceScore >= 70 ? "#ffa726" : "#ef5350",
                              borderRadius: 3
                            }
                          }} />
                      </Box>
                    ))
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

export default AdminDashboard;

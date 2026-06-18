import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Grid, Card, CardContent, Typography,
  CircularProgress, Alert, Chip,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import WarningIcon from "@mui/icons-material/Warning";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

// Stat card component
const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%" }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" color={color || "#1a1a2e"}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 1.5, borderRadius: 2,
            backgroundColor: `${color}15` || "#1a1a2e15",
            color: color || "#1a1a2e",
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get("/analytics/dashboard");
        setStats(data);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a1a2e">
          Welcome back, {user?.name} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Here's what's happening in your supply chain today.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {stats && (
        <>
          {/* Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Total Suppliers" value={stats.counts.totalSuppliers}
                icon={<LocalShippingIcon />} color="#4fc3f7"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Total Products" value={stats.counts.totalProducts}
                icon={<InventoryIcon />} color="#81c784"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Total Orders" value={stats.counts.totalOrders}
                icon={<ShoppingCartIcon />} color="#ce93d8"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Purchase Orders" value={stats.counts.totalPurchaseOrders}
                icon={<ShoppingCartIcon />} color="#ffb74d"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Total Users" value={stats.counts.totalUsers}
                icon={<PeopleIcon />} color="#4db6ac"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Low Stock Items" value={stats.counts.lowStockItems}
                icon={<WarningIcon />} color="#ef5350"
                subtitle="Needs immediate attention"
              />
            </Grid>
          </Grid>

          {/* Financials */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Total Revenue" icon={<AttachMoneyIcon />} color="#66bb6a"
                value={`₹${stats.financials.totalRevenue.toLocaleString()}`}
                subtitle="From delivered orders"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Procurement Cost" icon={<AttachMoneyIcon />} color="#ffa726"
                value={`₹${stats.financials.totalProcurementCost.toLocaleString()}`}
                subtitle="Total purchase orders"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Inventory Value" icon={<AttachMoneyIcon />} color="#42a5f5"
                value={`₹${stats.financials.totalInventoryValue.toLocaleString()}`}
                subtitle="Current stock value"
              />
            </Grid>
          </Grid>

          {/* Recent Orders + Top Suppliers */}
          <Grid container spacing={3}>
            {/* Recent Orders */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Recent Orders
                  </Typography>
                  {stats.recentOrders.length === 0 ? (
                    <Typography color="text.secondary">No orders yet.</Typography>
                  ) : (
                    stats.recentOrders.map((order) => (
                      <Box key={order._id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1, borderBottom: "1px solid #f0f0f0" }}>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {order.orderNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.retailer?.name || "Unknown"}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Chip
                            label={order.status} size="small"
                            color={order.status === "Delivered" ? "success" : order.status === "Pending" ? "warning" : "info"}
                          />
                          <Typography variant="caption" display="block" color="text.secondary">
                            ₹{order.totalAmount?.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Top Suppliers */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Top Suppliers
                  </Typography>
                  {stats.topSuppliers.length === 0 ? (
                    <Typography color="text.secondary">No suppliers yet.</Typography>
                  ) : (
                    stats.topSuppliers.map((supplier) => (
                      <Box key={supplier._id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1, borderBottom: "1px solid #f0f0f0" }}>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {supplier.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {supplier.supplierCode}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${supplier.performanceScore}%`} size="small"
                          color={supplier.performanceScore >= 90 ? "success" : supplier.performanceScore >= 70 ? "warning" : "error"}
                        />
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

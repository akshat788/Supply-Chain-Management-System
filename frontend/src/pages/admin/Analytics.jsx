import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Card, CardContent, Typography, Grid,
  CircularProgress, Alert,
} from "@mui/material";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Filler,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, Title, Filler
);

const COLORS = ["#4fc3f7", "#81c784", "#ce93d8", "#ffb74d", "#ef5350", "#90a4ae", "#4db6ac", "#f06292"];

const Analytics = () => {
  const [dashboard, setDashboard] = useState(null);
  const [orderAnalytics, setOrderAnalytics] = useState(null);
  const [inventoryAnalytics, setInventoryAnalytics] = useState(null);
  const [supplierAnalytics, setSupplierAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, orderRes, invRes, supRes] = await Promise.all([
          API.get("/analytics/dashboard"),
          API.get("/analytics/orders"),
          API.get("/analytics/inventory"),
          API.get("/analytics/suppliers"),
        ]);
        setDashboard(dashRes.data);
        setOrderAnalytics(orderRes.data);
        setInventoryAnalytics(invRes.data);
        setSupplierAnalytics(supRes.data);
      } catch {
        setError("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <Layout><Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box></Layout>;

  const chartOptions = { responsive: true, plugins: { legend: { position: "bottom" } } };

  // Order Status Pie
  const orderPieData = {
    labels: dashboard?.orderStatusBreakdown?.map(o => o._id) || [],
    datasets: [{ data: dashboard?.orderStatusBreakdown?.map(o => o.count) || [], backgroundColor: COLORS, borderWidth: 0 }],
  };

  // Inventory Category Pie
  const invPieData = {
    labels: inventoryAnalytics?.categoryBreakdown?.map(c => c.category) || [],
    datasets: [{ data: inventoryAnalytics?.categoryBreakdown?.map(c => c.totalAvailable) || [], backgroundColor: COLORS, borderWidth: 0 }],
  };

  // Monthly Revenue Line Chart
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyLineData = {
    labels: orderAnalytics?.monthlyOrders?.map(m => `${monthNames[m._id.month - 1]} ${m._id.year}`) || [],
    datasets: [
      {
        label: "Revenue (₹)",
        data: orderAnalytics?.monthlyOrders?.map(m => m.revenue) || [],
        borderColor: "#4fc3f7",
        backgroundColor: "#4fc3f720",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#4fc3f7",
      },
    ],
  };

  // Monthly Orders Bar
  const monthlyBarData = {
    labels: orderAnalytics?.monthlyOrders?.map(m => `${monthNames[m._id.month - 1]}`) || [],
    datasets: [{
      label: "Orders",
      data: orderAnalytics?.monthlyOrders?.map(m => m.count) || [],
      backgroundColor: "#81c784",
      borderRadius: 6,
    }],
  };

  // Supplier Performance Bar
  const supplierBarData = {
    labels: supplierAnalytics?.suppliers?.slice(0, 6).map(s => s.name) || [],
    datasets: [
      {
        label: "Performance Score",
        data: supplierAnalytics?.suppliers?.slice(0, 6).map(s => s.performanceScore) || [],
        backgroundColor: "#4fc3f7",
        borderRadius: 6,
      },
      {
        label: "On-Time Delivery",
        data: supplierAnalytics?.suppliers?.slice(0, 6).map(s => s.onTimeDelivery) || [],
        backgroundColor: "#81c784",
        borderRadius: 6,
      },
    ],
  };

  // Inventory Category Bar
  const categoryBarData = {
    labels: inventoryAnalytics?.categoryBreakdown?.map(c => c.category) || [],
    datasets: [
      {
        label: "Available Stock",
        data: inventoryAnalytics?.categoryBreakdown?.map(c => c.totalAvailable) || [],
        backgroundColor: "#4fc3f7",
        borderRadius: 6,
      },
      {
        label: "Reserved Stock",
        data: inventoryAnalytics?.categoryBreakdown?.map(c => c.totalReserved) || [],
        backgroundColor: "#ce93d8",
        borderRadius: 6,
      },
    ],
  };

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Analytics</Typography>
        <Typography variant="body2" color="text.secondary">Visual insights across your supply chain</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: "Total Revenue", value: `₹${(dashboard?.financials?.totalRevenue || 0).toLocaleString()}`, color: "#66bb6a" },
          { label: "Procurement Cost", value: `₹${(dashboard?.financials?.totalProcurementCost || 0).toLocaleString()}`, color: "#ffa726" },
          { label: "Inventory Value", value: `₹${(dashboard?.financials?.totalInventoryValue || 0).toLocaleString()}`, color: "#42a5f5" },
          { label: "Total Orders", value: dashboard?.counts?.totalOrders || 0, color: "#ce93d8" },
        ].map(item => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", textAlign: "center", p: 1 }}>
              <CardContent>
                <Typography variant="h5" fontWeight="bold" color={item.color}>{item.value}</Typography>
                <Typography variant="body2" color="text.secondary">{item.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Revenue Trend Line Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Revenue Trend (Last 6 Months)</Typography>
              {orderAnalytics?.monthlyOrders?.length > 0 ? (
                <Line data={monthlyLineData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } } }} />
              ) : (
                <Typography color="text.secondary" textAlign="center" py={4}>No revenue data yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Status Pie */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Order Status</Typography>
              {dashboard?.orderStatusBreakdown?.length > 0 ? (
                <Box sx={{ maxWidth: 250, mx: "auto" }}>
                  <Pie data={orderPieData} options={chartOptions} />
                </Box>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={4}>No orders yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Orders Bar */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Monthly Orders</Typography>
              {orderAnalytics?.monthlyOrders?.length > 0 ? (
                <Bar data={monthlyBarData} options={chartOptions} />
              ) : (
                <Typography color="text.secondary" textAlign="center" py={4}>No monthly data yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Supplier Performance Bar */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Supplier Performance</Typography>
              {supplierAnalytics?.suppliers?.length > 0 ? (
                <Bar data={supplierBarData} options={{ ...chartOptions, scales: { y: { max: 100 } } }} />
              ) : (
                <Typography color="text.secondary" textAlign="center" py={4}>No supplier data yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory by Category Bar */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Inventory by Category</Typography>
              {inventoryAnalytics?.categoryBreakdown?.length > 0 ? (
                <Bar data={categoryBarData} options={chartOptions} />
              ) : (
                <Typography color="text.secondary" textAlign="center" py={4}>No inventory data yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Distribution Pie */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Inventory Distribution</Typography>
              {inventoryAnalytics?.categoryBreakdown?.length > 0 ? (
                <Box sx={{ maxWidth: 250, mx: "auto" }}>
                  <Pie data={invPieData} options={chartOptions} />
                </Box>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={4}>No inventory data yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Analytics;

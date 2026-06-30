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

const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#fbbf24", "#ef4444", "#818cf8", "#f472b6", "#a78bfa"];

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
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#4f46e5",
      },
    ],
  };

  // Monthly Orders Bar
  const monthlyBarData = {
    labels: orderAnalytics?.monthlyOrders?.map(m => `${monthNames[m._id.month - 1]}`) || [],
    datasets: [{
      label: "Orders",
      data: orderAnalytics?.monthlyOrders?.map(m => m.count) || [],
      backgroundColor: "#10b981",
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
        backgroundColor: "#06b6d4",
        borderRadius: 6,
      },
      {
        label: "On-Time Delivery",
        data: supplierAnalytics?.suppliers?.slice(0, 6).map(s => s.onTimeDelivery) || [],
        backgroundColor: "#10b981",
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
        backgroundColor: "#4f46e5",
        borderRadius: 6,
      },
      {
        label: "Reserved Stock",
        data: inventoryAnalytics?.categoryBreakdown?.map(c => c.totalReserved) || [],
        backgroundColor: "#fbbf24",
        borderRadius: 6,
      },
    ],
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ fontFamily: "'Outfit', sans-serif" }}>Analytics</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Visual insights across your supply chain</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { label: "Total Revenue", value: `₹${(dashboard?.financials?.totalRevenue || 0).toLocaleString()}`, color: "#10b981" },
          { label: "Procurement Cost", value: `₹${(dashboard?.financials?.totalProcurementCost || 0).toLocaleString()}`, color: "#f59e0b" },
          { label: "Inventory Value", value: `₹${(dashboard?.financials?.totalInventoryValue || 0).toLocaleString()}`, color: "#06b6d4" },
          { label: "Total Orders", value: dashboard?.counts?.totalOrders || 0, color: "#4f46e5" },
        ].map(item => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={item.label}>
            <Card sx={{ textAlign: "center" }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h4" fontWeight="bold" color={item.color}>{item.value}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 0.5 }}>{item.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Revenue Trend Line Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: "100%" }}>
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
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Order Status</Typography>
              {dashboard?.orderStatusBreakdown?.length > 0 ? (
                <Box sx={{ maxWidth: 220, mx: "auto" }}>
                  <Pie data={orderPieData} options={chartOptions} />
                </Box>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={4}>No orders yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Orders Bar */}
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          <Card>
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
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          <Card>
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
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: "100%" }}>
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
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Inventory Distribution</Typography>
              {inventoryAnalytics?.categoryBreakdown?.length > 0 ? (
                <Box sx={{ maxWidth: 220, mx: "auto" }}>
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

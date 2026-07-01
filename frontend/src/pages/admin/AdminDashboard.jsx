import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import { getCleanName } from "../../utils/sanitize";
import {
  Box, Grid, Card, CardContent, Typography,
  CircularProgress, Alert, Chip, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import WarningIcon from "@mui/icons-material/Warning";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CategoryIcon from "@mui/icons-material/Category";

const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
  <Card sx={{
    height: "100%",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.02)",
    borderRadius: "16px",
    transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 12px 20px -4px rgba(15, 23, 42, 0.04)"
    }
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ p: 1.2, borderRadius: "10px", backgroundColor: `${color}10`, color: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </Box>
        {trend && (
          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: 0.2,
            borderRadius: "20px",
            backgroundColor: trend.type === "up" ? "#ecfdf5" : "#fef2f2",
            color: trend.type === "up" ? "#059669" : "#dc2626",
            fontSize: "11px",
            fontWeight: 700
          }}>
            {trend.type === "up" ? "↑" : "↓"} {trend.value}
          </Box>
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight={800} color="#0f172a" sx={{ mt: 0.5, fontFamily: "'Outfit', sans-serif" }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" display="block" mt={0.5} sx={{ fontStyle: "italic" }}>
          {subtitle}
        </Typography>
      )}
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

  useEffect(() => {
    setTimeout(() => {
      const xpath = "//*[text()='Total Suppliers']";
      const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      let element = result.singleNodeValue;
      if (!element) {
        console.log("Total Suppliers element not found");
        return;
      }
      
      console.log("=== START PARENT CHAIN ===");
      while (element && element !== document.documentElement) {
        const styles = window.getComputedStyle(element);
        const info = {
          tagName: element.tagName,
          id: element.id,
          classList: Array.from(element.classList),
          sizes: {
            offsetWidth: element.offsetWidth,
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth
          },
          computedStyles: {
            width: styles.getPropertyValue('width'),
            maxWidth: styles.getPropertyValue('max-width'),
            minWidth: styles.getPropertyValue('min-width'),
            display: styles.getPropertyValue('display'),
            margin: styles.getPropertyValue('margin'),
            padding: styles.getPropertyValue('padding'),
            boxSizing: styles.getPropertyValue('box-sizing'),
            flexGrow: styles.getPropertyValue('flex-grow')
          }
        };
        console.log("CHAIN_ELEMENT:", JSON.stringify(info));
        element = element.parentElement;
      }
      console.log("=== END PARENT CHAIN ===");
    }, 2000);
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
        <Typography variant="h4" fontWeight={900} color="#0f172a" sx={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.5px" }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
          Overview of your logistics & supply chain operations
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {stats && (
        <>
          {/* Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard title="Total Suppliers" value={stats.counts.totalSuppliers} icon={<LocalShippingIcon />} color="#ea580c" trend={{ type: "up", value: "8% vs last month" }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard title="Total Products" value={stats.counts.totalProducts} icon={<InventoryIcon />} color="#0f172a" trend={{ type: "up", value: "12% vs last month" }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard title="Total Orders" value={stats.counts.totalOrders} icon={<ShoppingCartIcon />} color="#10b981" trend={{ type: "up", value: "15% vs last week" }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard title="Low Stock Items" value={stats.counts.lowStockItems} icon={<WarningIcon />} color="#ef4444" trend={{ type: "down", value: "4% reduction" }} subtitle="Needs attention" />
            </Grid>
          </Grid>

          {/* Financials */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <StatCard title="Total Revenue" icon={<AttachMoneyIcon />} color="#10b981" value={`₹${stats.financials.totalRevenue.toLocaleString()}`} trend={{ type: "up", value: "18% vs last week" }} subtitle="From delivered orders" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <StatCard title="Procurement Cost" icon={<AttachMoneyIcon />} color="#ea580c" value={`₹${stats.financials.totalProcurementCost.toLocaleString()}`} trend={{ type: "down", value: "2% savings" }} subtitle="Total purchase orders" />
            </Grid>
            <Grid size={{ xs: 12, sm: 12, lg: 4 }}>
              <StatCard title="Inventory Value" icon={<AttachMoneyIcon />} color="#0f172a" value={`₹${stats.financials.totalInventoryValue.toLocaleString()}`} trend={{ type: "up", value: "6% appreciation" }} subtitle="Current stock value" />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Order Status Overview */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: "100%", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.02)" }}>
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
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: "100%", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.02)" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Inventory Health</Typography>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Healthy Stock</Typography>
                      <Typography variant="body2" fontWeight={600} color="#10b981">{healthPct}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={healthPct}
                      sx={{ height: 8, borderRadius: 5, backgroundColor: "#fee2e2", "& .MuiLinearProgress-bar": { backgroundColor: "#10b981", borderRadius: 5 } }} />
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Box sx={{ textAlign: "center", p: 1.5, borderRadius: 2, backgroundColor: "#ecfdf5", flex: 1, mr: 1 }}>
                      <Typography variant="h6" fontWeight="bold" color="#10b981">{healthyStock}</Typography>
                      <Typography variant="caption" color="text.secondary">Healthy</Typography>
                    </Box>
                    <Box sx={{ textAlign: "center", p: 1.5, borderRadius: 2, backgroundColor: "#fef2f2", flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold" color="#ef4444">{stats.counts.lowStockItems}</Typography>
                      <Typography variant="caption" color="text.secondary">Low Stock</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activity Feed */}
            <Grid size={{ xs: 12, md: 12, lg: 4 }}>
              <Card sx={{ height: "100%", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.02)" }}>
                <CardContent sx={{ pb: "16px !important" }}>
                  <Typography variant="h6" fontWeight={600} mb={2}>Recent Activity</Typography>
                  {stats.recentOrders.length === 0 && stats.recentPurchaseOrders.length === 0 ? (
                    <Typography color="text.secondary" variant="body2">No recent activity.</Typography>
                  ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 220, overflowY: "auto", backgroundColor: "transparent" }}>
                      <Table size="small">
                        <TableBody>
                          {[
                            ...stats.recentOrders.slice(0, 2).map(o => ({
                              type: "Order",
                              ref: o.orderNumber,
                              status: o.status,
                              statusColor: getStatusColor(o.status),
                              time: new Date(o.createdAt).toLocaleDateString()
                            })),
                            ...stats.recentPurchaseOrders.slice(0, 2).map(o => ({
                              type: "PO",
                              ref: o.poNumber,
                              status: o.status,
                              statusColor: getStatusColor(o.status),
                              time: new Date(o.createdAt).toLocaleDateString()
                            })),
                            ...stats.topSuppliers.slice(0, 1).map(s => ({
                              type: "Supplier",
                              ref: s.name,
                              status: `Score ${s.performanceScore}%`,
                              statusColor: s.performanceScore >= 90 ? "success" : "warning",
                              time: "Active"
                            }))
                          ].slice(0, 5).map((item, i) => (
                            <TableRow key={i} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                              <TableCell sx={{ borderBottom: "1px solid #f1f5f9", pl: 0, py: 1 }}>
                                <Typography variant="body2" fontWeight={700} color="#0f172a">
                                  {item.type}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "10.5px" }} noWrap>
                                  {item.ref}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 1 }}>
                                <Chip label={item.status} size="small" color={item.statusColor} sx={{ height: 20, fontSize: "11px", fontWeight: 700 }} />
                              </TableCell>
                              <TableCell align="right" sx={{ borderBottom: "1px solid #f1f5f9", pr: 0, py: 1 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                  {item.time}
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
          </Grid>

          {/* Recent Orders + Top Suppliers */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.02)" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Recent Orders</Typography>
                  {stats.recentOrders.length === 0 ? (
                    <Typography color="text.secondary">No orders yet.</Typography>
                  ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: "transparent" }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, pl: 0, borderBottom: "2px solid #e2e8f0" }}>Order Details</TableCell>
                            <TableCell sx={{ fontWeight: 700, borderBottom: "2px solid #e2e8f0" }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, pr: 0, borderBottom: "2px solid #e2e8f0" }}>Amount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.recentOrders.map((order) => (
                            <TableRow key={order._id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                              <TableCell sx={{ borderBottom: "1px solid #f1f5f9", pl: 0, py: 1.5 }}>
                                <Typography variant="body2" fontWeight={700} color="#0f172a">
                                  {order.orderNumber}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                  {order.retailer?.name || "Unknown"}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 1.5 }}>
                                <Chip label={order.status} size="small" color={getStatusColor(order.status)} sx={{ fontWeight: 600 }} />
                              </TableCell>
                              <TableCell align="right" sx={{ borderBottom: "1px solid #f1f5f9", pr: 0, py: 1.5 }}>
                                <Typography variant="body2" fontWeight={700} color="#0f172a">
                                  ₹{order.totalAmount?.toLocaleString()}
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

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.02)" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Top Suppliers</Typography>
                  {stats.topSuppliers.length === 0 ? (
                    <Typography color="text.secondary">No suppliers yet.</Typography>
                  ) : (
                    stats.topSuppliers.map((supplier) => (
                      <Box key={supplier._id} sx={{ mb: 2.5 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{supplier.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{supplier.supplierCode}</Typography>
                          </Box>
                          <Chip label={`${supplier.performanceScore}%`} size="small"
                            color={supplier.performanceScore >= 90 ? "success" : supplier.performanceScore >= 70 ? "warning" : "error"} />
                        </Box>
                        <LinearProgress variant="determinate" value={supplier.performanceScore}
                          sx={{ height: 6, borderRadius: 3, backgroundColor: "#f1f5f9",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: supplier.performanceScore >= 90 ? "#10b981" : supplier.performanceScore >= 70 ? "#f59e0b" : "#ef4444",
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

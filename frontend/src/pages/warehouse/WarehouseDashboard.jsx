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
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningIcon from "@mui/icons-material/Warning";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InboxIcon from "@mui/icons-material/Inbox";
import AssignmentIcon from "@mui/icons-material/Assignment";

const statusColors = {
  Pending: "warning", Approved: "info", Allocated: "secondary",
  Dispatched: "primary", Delivered: "success", Cancelled: "error",
  Confirmed: "info", Shipped: "primary",
};

const WarehouseDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, invRes, txRes] = await Promise.all([
          API.get("/analytics/dashboard"),
          API.get("/inventory"),
          API.get("/inventory-transactions"),
        ]);
        setStats(dashRes.data);
        setInventory(invRes.data.inventory);
        setTransactions(txRes.data.transactions);
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Layout><Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box></Layout>;

  const lowStockCount = inventory.filter(i => i.availableStock <= i.minimumStockLevel && i.availableStock > 0).length;
  const outOfStockCount = inventory.filter(i => i.availableStock === 0).length;
  const healthyCount = inventory.filter(i => i.availableStock > i.minimumStockLevel).length;
  const healthPct = inventory.length > 0 ? Math.round((healthyCount / inventory.length) * 100) : 0;

  const incomingShipments = stats?.poStatusBreakdown?.find(p => p._id === "Shipped")?.count || 0;
  const pendingOrders = stats?.orderStatusBreakdown
    ?.filter(o => ["Pending", "Approved"].includes(o._id))
    ?.reduce((sum, o) => sum + o.count, 0) || 0;

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ fontFamily: "'Outfit', sans-serif" }}>
          Welcome, {getCleanName(user)} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Warehouse operations overview</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>Total Products</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#4f46e5" sx={{ mt: 0.5 }}>{inventory.length}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: "12px", backgroundColor: "#4f46e515", color: "#4f46e5" }}>
                  <InventoryIcon sx={{ fontSize: 28 }} />
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
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>Incoming Shipments</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#06b6d4" sx={{ mt: 0.5 }}>{incomingShipments}</Typography>
                  <Typography variant="caption" color="text.secondary">POs in transit</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: "12px", backgroundColor: "#06b6d415", color: "#06b6d4" }}>
                  <InboxIcon sx={{ fontSize: 28 }} />
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
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>Orders To Pack</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#f59e0b" sx={{ mt: 0.5 }}>{pendingOrders}</Typography>
                  <Typography variant="caption" color="text.secondary">Pending fulfillment</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: "12px", backgroundColor: "#f59e0b15", color: "#f59e0b" }}>
                  <AssignmentIcon sx={{ fontSize: 28 }} />
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
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>Low Stock Items</Typography>
                  <Typography variant="h5" fontWeight="bold" color="#ef4444" sx={{ mt: 0.5 }}>{lowStockCount}</Typography>
                  <Typography variant="caption" color="text.secondary">{outOfStockCount} out of stock</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: "12px", backgroundColor: "#ef444415", color: "#ef4444" }}>
                  <WarningIcon sx={{ fontSize: 28 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Inventory Health */}
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Inventory Health</Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Healthy Stock</Typography>
                  <Typography variant="body2" fontWeight={600} color="#10b981">{healthPct}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={healthPct}
                  sx={{ height: 8, borderRadius: 5, backgroundColor: "#fee2e2",
                    "& .MuiLinearProgress-bar": { backgroundColor: "#10b981", borderRadius: 5 } }} />
              </Box>
              <Grid container spacing={1}>
                <Grid size={{ xs: 4 }}>
                  <Box sx={{ textAlign: "center", p: 1, borderRadius: 2, backgroundColor: "#ecfdf5" }}>
                    <Typography variant="h6" fontWeight="bold" color="#10b981">{healthyCount}</Typography>
                    <Typography variant="caption" color="text.secondary">Healthy</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Box sx={{ textAlign: "center", p: 1, borderRadius: 2, backgroundColor: "#fffbeb" }}>
                    <Typography variant="h6" fontWeight="bold" color="#f59e0b">{lowStockCount}</Typography>
                    <Typography variant="caption" color="text.secondary">Low</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Box sx={{ textAlign: "center", p: 1, borderRadius: 2, backgroundColor: "#fef2f2" }}>
                    <Typography variant="h6" fontWeight="bold" color="#ef4444">{outOfStockCount}</Typography>
                    <Typography variant="caption" color="text.secondary">Out</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Warehouse Activity Feed */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <Card sx={{ height: "100%", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.02)" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Warehouse Activity</Typography>
              {transactions.length === 0 ? (
                <Typography color="text.secondary">No activity yet.</Typography>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: "transparent" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, pl: 0, borderBottom: "2px solid #e2e8f0" }}>Activity / Product</TableCell>
                        <TableCell sx={{ fontWeight: 700, borderBottom: "2px solid #e2e8f0" }}>Type</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, pr: 0, borderBottom: "2px solid #e2e8f0" }}>Quantity</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.slice(0, 6).map((tx, i) => (
                        <TableRow key={i} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell sx={{ borderBottom: "1px solid #f1f5f9", pl: 0, py: 1 }}>
                            <Typography variant="body2" fontWeight={700} color="#0f172a">
                              {tx.action}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                              {tx.product?.name} {tx.reference && `• Ref: ${tx.reference}`}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ borderBottom: "1px solid #f1f5f9", py: 1 }}>
                            <Chip
                              label={tx.type === "IN" ? "Stock In" : "Stock Out"}
                              size="small"
                              color={tx.type === "IN" ? "success" : "error"}
                              sx={{ fontWeight: 600, height: 20, fontSize: "11px" }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: "1px solid #f1f5f9", pr: 0, py: 1 }}>
                            <Typography variant="body2" fontWeight={700} color={tx.type === "IN" ? "#10b981" : "#ef4444"}>
                              {tx.type === "IN" ? `+${tx.quantity}` : `-${tx.quantity}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "10.5px" }}>
                              {new Date(tx.createdAt).toLocaleTimeString()}
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

      {/* Recent Orders + Recent POs */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.02)" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Recent Orders</Typography>
              {stats?.recentOrders?.length === 0 ? (
                <Typography color="text.secondary">No orders yet.</Typography>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: "transparent" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, pl: 0, borderBottom: "2px solid #e2e8f0" }}>Order Details</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, pr: 0, borderBottom: "2px solid #e2e8f0" }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats?.recentOrders?.slice(0, 5).map(order => (
                        <TableRow key={order._id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell sx={{ borderBottom: "1px solid #f1f5f9", pl: 0, py: 1.5 }}>
                            <Typography variant="body2" fontWeight={700} color="#0f172a">
                              {order.orderNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                              {order.retailer?.name || "Unknown"}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: "1px solid #f1f5f9", pr: 0, py: 1.5 }}>
                            <Chip label={order.status} size="small" color={statusColors[order.status] || "default"} sx={{ fontWeight: 600 }} />
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
          <Card sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.02)" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Recent Purchase Orders</Typography>
              {stats?.recentPurchaseOrders?.length === 0 ? (
                <Typography color="text.secondary">No purchase orders yet.</Typography>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: "transparent" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, pl: 0, borderBottom: "2px solid #e2e8f0" }}>PO Details</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, pr: 0, borderBottom: "2px solid #e2e8f0" }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats?.recentPurchaseOrders?.slice(0, 5).map(po => (
                        <TableRow key={po._id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell sx={{ borderBottom: "1px solid #f1f5f9", pl: 0, py: 1.5 }}>
                            <Typography variant="body2" fontWeight={700} color="#0f172a">
                              {po.poNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                              {po.supplier?.name || "Unknown"}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: "1px solid #f1f5f9", pr: 0, py: 1.5 }}>
                            <Chip label={po.status} size="small" color={statusColors[po.status] || "default"} sx={{ fontWeight: 600 }} />
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
    </Layout>
  );
};

export default WarehouseDashboard;

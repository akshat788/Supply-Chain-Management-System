import React, { useEffect, useState } from "react";
import API from "../api/axios";
import {
  IconButton, Badge, Popover, Box, Typography,
  List, ListItem, ListItemText, Divider, Chip, Button,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InfoIcon from "@mui/icons-material/Info";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const [invRes, ordersRes, poRes] = await Promise.all([
        API.get("/inventory"),
        API.get("/orders").catch(() => ({ data: { orders: [] } })),
        API.get("/purchase-orders").catch(() => ({ data: { orders: [] } })),
      ]);

      const notifs = [];

      // Low stock alerts
      const inventory = invRes.data.inventory || [];
      inventory.forEach(item => {
        if (item.availableStock <= item.minimumStockLevel && item.availableStock > 0) {
          notifs.push({
            id: `low-${item._id}`,
            type: "warning",
            title: "Low Stock Alert",
            message: `${item.product?.name} is running low (${item.availableStock} units left)`,
            time: new Date(item.lastUpdated),
            icon: <WarningIcon fontSize="small" sx={{ color: "#ffa726" }} />,
          });
        }
        if (item.availableStock === 0) {
          notifs.push({
            id: `out-${item._id}`,
            type: "error",
            title: "Out of Stock",
            message: `${item.product?.name} is completely out of stock!`,
            time: new Date(item.lastUpdated),
            icon: <WarningIcon fontSize="small" sx={{ color: "#ef5350" }} />,
          });
        }
      });

      // Recent orders (last 24 hours)
      const orders = ordersRes.data.orders || [];
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      orders.filter(o => new Date(o.createdAt) > oneDayAgo).slice(0, 3).forEach(order => {
        notifs.push({
          id: `order-${order._id}`,
          type: "info",
          title: "New Order",
          message: `Order ${order.orderNumber} placed — ${order.status}`,
          time: new Date(order.createdAt),
          icon: <ShoppingCartIcon fontSize="small" sx={{ color: "#4fc3f7" }} />,
        });
      });

      // Delivered orders (last 24 hours)
      orders.filter(o => o.status === "Delivered" && new Date(o.updatedAt) > oneDayAgo)
        .slice(0, 2).forEach(order => {
          notifs.push({
            id: `delivered-${order._id}`,
            type: "success",
            title: "Order Delivered",
            message: `Order ${order.orderNumber} has been delivered successfully`,
            time: new Date(order.updatedAt),
            icon: <CheckCircleIcon fontSize="small" sx={{ color: "#66bb6a" }} />,
          });
        });

      // Pending POs needing action
      const pos = poRes.data.orders || [];
      const pendingPOs = pos.filter(po => po.status === "Pending");
      if (pendingPOs.length > 0) {
        notifs.push({
          id: "pending-pos",
          type: "warning",
          title: "Purchase Orders Pending",
          message: `${pendingPOs.length} purchase order(s) waiting for confirmation`,
          time: new Date(),
          icon: <LocalShippingIcon fontSize="small" sx={{ color: "#ffb74d" }} />,
        });
      }

      // Shipped POs awaiting delivery
      const shippedPOs = pos.filter(po => po.status === "Shipped");
      if (shippedPOs.length > 0) {
        notifs.push({
          id: "shipped-pos",
          type: "info",
          title: "Incoming Shipments",
          message: `${shippedPOs.length} shipment(s) in transit`,
          time: new Date(),
          icon: <LocalShippingIcon fontSize="small" sx={{ color: "#4fc3f7" }} />,
        });
      }

      // Sort by time (newest first)
      notifs.sort((a, b) => b.time - a.time);
      setNotifications(notifs.slice(0, 10));
      setUnreadCount(notifs.length);
    } catch (err) {
      // Silently fail — notifications are non-critical
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    setUnreadCount(0);
  };

  const handleClose = () => setAnchorEl(null);

  const getBgColor = (type) => {
    const map = { warning: "#fff8e1", error: "#ffebee", success: "#e8f5e9", info: "#e3f2fd" };
    return map[type] || "#f5f5f5";
  };

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ color: "#fff" }}>
        <Badge badgeContent={unreadCount} color="error" max={9}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { width: 360, maxHeight: 480, borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" } }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" fontWeight={600}>Notifications</Typography>
          <Chip label={`${notifications.length} alerts`} size="small" color="primary" />
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <InfoIcon sx={{ fontSize: 48, color: "#e0e0e0" }} />
            <Typography color="text.secondary" mt={1}>No notifications</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, overflowY: "auto", maxHeight: 380 }}>
            {notifications.map((notif, i) => (
              <React.Fragment key={notif.id}>
                <ListItem sx={{ px: 2, py: 1.5, backgroundColor: getBgColor(notif.type), "&:hover": { opacity: 0.9 } }}>
                  <Box sx={{ display: "flex", gap: 1.5, width: "100%", alignItems: "flex-start" }}>
                    <Box sx={{ mt: 0.3 }}>{notif.icon}</Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{notif.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{notif.message}</Typography>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.3 }}>
                        {notif.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
                {i < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        <Box sx={{ p: 1.5, borderTop: "1px solid #f0f0f0", textAlign: "center" }}>
          <Button size="small" onClick={() => { fetchNotifications(); handleClose(); }}>
            Refresh
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;

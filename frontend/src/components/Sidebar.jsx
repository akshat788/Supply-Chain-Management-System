import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { getCleanName } from "../utils/sanitize";
import logo from "../assets/logo.jpg";
import {
  List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Box, Divider, Avatar,
  useMediaQuery, useTheme, Button,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CategoryIcon from "@mui/icons-material/Category";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

const menuItems = {
  admin: [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
    { text: "Suppliers", icon: <LocalShippingIcon />, path: "/admin/suppliers" },
    { text: "Products", icon: <CategoryIcon />, path: "/admin/products" },
    { text: "Inventory", icon: <InventoryIcon />, path: "/admin/inventory" },
    { text: "Purchase Orders", icon: <ShoppingCartIcon />, path: "/admin/purchase-orders" },
    { text: "Orders", icon: <StorefrontIcon />, path: "/admin/orders" },
    { text: "Users", icon: <PeopleIcon />, path: "/admin/users" },
    { text: "Analytics", icon: <BarChartIcon />, path: "/admin/analytics" },
    { text: "SC Tracking", icon: <TrackChangesIcon />, path: "/admin/tracking" },
  ],
  supplier: [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/supplier/dashboard" },
    { text: "Products", icon: <CategoryIcon />, path: "/supplier/products" },
    { text: "Purchase Orders", icon: <ShoppingCartIcon />, path: "/supplier/purchase-orders" },
  ],
  warehouse_manager: [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/warehouse/dashboard" },
    { text: "Products", icon: <CategoryIcon />, path: "/warehouse/products" },
    { text: "Inventory", icon: <InventoryIcon />, path: "/warehouse/inventory" },
    { text: "Purchase Orders", icon: <ShoppingCartIcon />, path: "/warehouse/purchase-orders" },
    { text: "Orders", icon: <StorefrontIcon />, path: "/warehouse/orders" },
    { text: "Transactions", icon: <ReceiptLongIcon />, path: "/warehouse/transactions" },
  ],
  retailer: [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/retailer/dashboard" },
    { text: "Products", icon: <CategoryIcon />, path: "/retailer/products" },
    { text: "My Orders", icon: <ShoppingCartIcon />, path: "/retailer/orders" },
  ],
};

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const items = menuItems[user?.role] || [];

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile && onClose) onClose();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Box sx={{
      width: 240, height: "100vh",
      background: "#0f172a",
      color: "#fff", display: "flex", flexDirection: "column",
      borderRight: "1px solid rgba(255, 255, 255, 0.08)",
    }}>
      {/* Logo */}
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 1.5, borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <img src={logo} alt="SupplySync" style={{ height: 38, backgroundColor: "#ffffff", padding: "3px", borderRadius: "6px" }} />
        <Box sx={{ textAlign: "left" }}>
          <Typography variant="h6" fontWeight="bold" color="#ffffff" sx={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "0.5px", lineHeight: 1.2, fontSize: 16 }}>
            SupplySync
          </Typography>
          <Typography variant="caption" color="rgba(255, 255, 255, 0.4)" sx={{ display: "block", fontSize: "10px" }}>Supply Made Easy</Typography>
        </Box>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <Avatar sx={{ bgcolor: "#ea580c", color: "#fff", width: 38, height: 38, fontSize: 15, fontWeight: "bold" }}>
          {getCleanName(user)?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="body2" fontWeight="bold" color="#fff" sx={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
            {getCleanName(user)}
          </Typography>
          <Typography variant="caption" color="rgba(255, 255, 255, 0.5)" sx={{ textTransform: "capitalize", display: "block" }}>
            {user?.role?.replace("_", " ")}
          </Typography>
        </Box>
      </Box>

      {/* Menu Items Container */}
      <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: "auto", px: 1, pt: 2 }}>
        <List sx={{ p: 0 }}>
          {items.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton onClick={() => handleNavigate(item.path)}
                  sx={{
                    borderRadius: "8px",
                    py: 1, px: 1.5,
                    backgroundColor: isActive ? "rgba(234, 88, 12, 0.12)" : "transparent",
                    borderLeft: isActive ? "3px solid #ea580c" : "3px solid transparent",
                    transition: "all 0.2s ease",
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.05)" },
                  }}>
                  <ListItemIcon sx={{ color: isActive ? "#ea580c" : "rgba(255, 255, 255, 0.5)", minWidth: 32 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text}
                    primaryTypographyProps={{
                      fontSize: 13.5,
                      color: isActive ? "#ea580c" : "rgba(255, 255, 255, 0.8)",
                      fontWeight: isActive ? 600 : 400,
                    }} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Bottom CTA Card */}
      {user?.role === "admin" && (
        <Box sx={{ px: 2, pb: 2, mt: 2 }}>
          <Box sx={{
            backgroundColor: "#1e293b",
            borderRadius: "12px",
            p: 2,
            border: "1px solid rgba(255, 255, 255, 0.05)",
            textAlign: "left",
            position: "relative",
            overflow: "hidden"
          }}>
            <Typography variant="body2" fontWeight={700} color="#ffffff" mb={0.5} sx={{ fontSize: "12px", lineHeight: 1.3 }}>
              Deliver faster with real-time tracking
            </Typography>
            <Typography variant="caption" color="rgba(255, 255, 255, 0.4)" display="block" sx={{ fontSize: "10px", lineHeight: 1.2, mb: 1.5 }}>
              Monitor transit status & verify dispatch times.
            </Typography>
            <Box sx={{ display: "block" }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleNavigate("/admin/tracking")}
                sx={{
                  backgroundColor: "#ffffff",
                  color: "#0f172a",
                  fontWeight: 700,
                  fontSize: "10.5px",
                  py: 0.5,
                  px: 1.5,
                  borderRadius: "6px",
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#f1f5f9",
                    boxShadow: "none"
                  }
                }}
              >
                Track Now →
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)" }} />

      {/* Logout */}
      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}
            sx={{ borderRadius: "8px", py: 1, px: 1.5, "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.15)" } }}>
            <ListItemIcon sx={{ color: "#f87171", minWidth: 32 }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 13.5, color: "#f87171", fontWeight: 500 }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;

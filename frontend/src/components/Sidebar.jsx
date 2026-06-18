import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Box, Divider, Avatar,
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

const DRAWER_WIDTH = 240;

// Menu items per role
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
  ],
  supplier: [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/supplier/dashboard" },
    { text: "Products", icon: <CategoryIcon />, path: "/supplier/products" },
    { text: "Purchase Orders", icon: <ShoppingCartIcon />, path: "/supplier/purchase-orders" },
  ],
  warehouse_manager: [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/warehouse/dashboard" },
    { text: "Inventory", icon: <InventoryIcon />, path: "/warehouse/inventory" },
    { text: "Purchase Orders", icon: <ShoppingCartIcon />, path: "/warehouse/purchase-orders" },
    { text: "Orders", icon: <StorefrontIcon />, path: "/warehouse/orders" },
  ],
  retailer: [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/retailer/dashboard" },
    { text: "Products", icon: <CategoryIcon />, path: "/retailer/products" },
    { text: "My Orders", icon: <ShoppingCartIcon />, path: "/retailer/orders" },
  ],
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const items = menuItems[user?.role] || [];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          backgroundColor: "#1a1a2e",
          color: "#fff",
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 2, textAlign: "center", borderBottom: "1px solid #ffffff20" }}>
        <Typography variant="h6" fontWeight="bold" color="#4fc3f7">
          SCM System
        </Typography>
        <Typography variant="caption" color="#ffffff80">
          Supply Chain Management
        </Typography>
      </Box>

      {/* User info */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1, borderBottom: "1px solid #ffffff20" }}>
        <Avatar sx={{ bgcolor: "#4fc3f7", width: 36, height: 36, fontSize: 14 }}>
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight="bold" color="#fff">
            {user?.name}
          </Typography>
          <Typography variant="caption" color="#ffffff80" sx={{ textTransform: "capitalize" }}>
            {user?.role?.replace("_", " ")}
          </Typography>
        </Box>
      </Box>

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 1, borderRadius: 2, mb: 0.5,
                  backgroundColor: isActive ? "#4fc3f720" : "transparent",
                  borderLeft: isActive ? "3px solid #4fc3f7" : "3px solid transparent",
                  "&:hover": { backgroundColor: "#4fc3f710" },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? "#4fc3f7" : "#ffffff80", minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: 14,
                    color: isActive ? "#4fc3f7" : "#ffffffcc",
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "#ffffff20" }} />

      {/* Logout */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ mx: 1, borderRadius: 2, "&:hover": { backgroundColor: "#ff525220" } }}>
            <ListItemIcon sx={{ color: "#ff5252", minWidth: 36 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14, color: "#ff5252" }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;

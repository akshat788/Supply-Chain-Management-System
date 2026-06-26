import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box, IconButton, AppBar, Toolbar, Typography,
  useMediaQuery, useTheme, Drawer, Avatar, Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";

const DRAWER_WIDTH = 240;

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const rolePathMap = {
    admin: "/admin",
    supplier: "/supplier",
    warehouse_manager: "/warehouse",
    retailer: "/retailer",
  };

  const handleProfileClick = () => {
    const base = rolePathMap[user?.role] || "";
    navigate(`${base}/profile`);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar position="fixed" sx={{ backgroundColor: "#1a1a2e", zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" fontWeight="bold" color="#4fc3f7">SCM System</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <NotificationBell />
              <Tooltip title="My Profile">
                <IconButton onClick={handleProfileClick} sx={{ color: "#fff" }}>
                  <Avatar sx={{ width: 30, height: 30, fontSize: 13, bgcolor: "#4fc3f7" }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop top bar (slim) */}
      {!isMobile && (
        <AppBar position="fixed" sx={{
          backgroundColor: "#1a1a2e",
          zIndex: theme.zIndex.drawer + 1,
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          ml: `${DRAWER_WIDTH}px`,
          boxShadow: "none",
          borderBottom: "1px solid #ffffff10",
        }}>
          <Toolbar sx={{ justifyContent: "flex-end", minHeight: "48px !important" }}>
            <NotificationBell />
            <Tooltip title="My Profile">
              <IconButton onClick={handleProfileClick} sx={{ color: "#fff", ml: 1 }}>
                <Avatar sx={{ width: 30, height: 30, fontSize: 13, bgcolor: "#4fc3f7" }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" } }}
        >
          <Sidebar onClose={handleDrawerToggle} />
        </Drawer>
      ) : (
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0 }}>
          <Box sx={{ position: "fixed", top: 0, left: 0, width: DRAWER_WIDTH, height: "100vh", zIndex: theme.zIndex.drawer }}>
            <Sidebar />
          </Box>
        </Box>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: isMobile ? 8 : 6,
          overflow: "auto",
          minWidth: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;

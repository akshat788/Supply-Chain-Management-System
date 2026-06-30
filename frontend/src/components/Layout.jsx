import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box, IconButton, AppBar, Toolbar, Typography,
  useMediaQuery, useTheme, Drawer, Avatar, Tooltip, Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";
import { getCleanName } from "../utils/sanitize";
import logo from "../assets/logo.jpg";

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
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "background.default" }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar position="fixed" sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          boxShadow: "none",
          borderBottom: "1px solid #e2e8f0",
        }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton color="default" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1, color: "text.primary" }}>
                <MenuIcon />
              </IconButton>
              <img src={logo} alt="SupplySync" style={{ height: 32, marginRight: 8, borderRadius: "4px" }} />
              <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ fontFamily: "'Outfit', sans-serif" }}>
                SupplySync
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <NotificationBell />
              <Tooltip title="My Profile">
                <IconButton onClick={handleProfileClick}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: "secondary.main", color: "#fff", fontWeight: "bold" }}>
                    {getCleanName(user)?.charAt(0).toUpperCase()}
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
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          zIndex: theme.zIndex.drawer + 1,
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          ml: `${DRAWER_WIDTH}px`,
          boxShadow: "none",
          borderBottom: "1px solid #e2e8f0",
        }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between", minHeight: "56px !important", px: 3 }}>
            {/* Left side: Creative greeting & Pulse status indicator */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography variant="caption" sx={{ display: "flex", alignItems: "center", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", fontWeight: 700 }}>
                Status:
                <Box component="span" sx={{
                  width: 8, height: 8,
                  borderRadius: "50%",
                  bgcolor: "success.main",
                  display: "inline-block",
                  ml: 1, mr: 0.5,
                  boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.7)",
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%": {
                      transform: "scale(0.95)",
                      boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.7)",
                    },
                    "70%": {
                      transform: "scale(1)",
                      boxShadow: "0 0 0 6px rgba(16, 185, 129, 0)",
                    },
                    "100%": {
                      transform: "scale(0.95)",
                      boxShadow: "0 0 0 0 rgba(16, 185, 129, 0)",
                    }
                  }
                }} />
                <Typography component="span" variant="caption" sx={{ fontWeight: 700, color: "#10b981", mr: 1.5 }}>Healthy</Typography>
              </Typography>
              
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 14, alignSelf: "center", borderColor: "#e2e8f0" }} />
              
              <Typography variant="body2" sx={{ color: "#475569", fontWeight: 500 }}>
                Welcome, <strong style={{ color: "#0f172a" }}>{getCleanName(user)}</strong>
              </Typography>

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 14, alignSelf: "center", borderColor: "#e2e8f0" }} />

              <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </Typography>
            </Box>

            {/* Middle: Premium Search Bar */}
            <Box sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              backgroundColor: "#f1f5f9",
              borderRadius: "20px",
              px: 2,
              py: 0.5,
              width: "360px",
              border: "1px solid transparent",
              transition: "all 0.3s ease",
              "&:focus-within": {
                backgroundColor: "#ffffff",
                borderColor: "secondary.main",
                boxShadow: "0 0 0 3px rgba(234, 88, 12, 0.12)"
              }
            }}>
              <SearchIcon sx={{ color: "#94a3b8", mr: 1, fontSize: 18 }} />
              <input
                type="text"
                placeholder="Search products, orders, SKU, tracking..."
                style={{
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  width: "100%",
                  fontSize: "13px",
                  color: "#0f172a",
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              />
            </Box>

            {/* Right side: Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <NotificationBell />
              <Tooltip title="My Profile">
                <IconButton onClick={handleProfileClick} sx={{ ml: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: "secondary.main", color: "#fff", fontWeight: "bold" }}>
                    {getCleanName(user)?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
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
          p: { xs: 3, sm: 4, md: 5 },
          mt: isMobile ? 8 : 7,
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

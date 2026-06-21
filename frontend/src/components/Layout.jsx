import React, { useState } from "react";
import { Box, IconButton, AppBar, Toolbar, Typography, useMediaQuery, useTheme, Drawer } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "./Sidebar";

const DRAWER_WIDTH = 240;

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar position="fixed" sx={{ backgroundColor: "#1a1a2e", zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="bold" color="#4fc3f7">SCM System</Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar — permanent on desktop, drawer on mobile */}
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
        <Sidebar />
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: isMobile ? 8 : 0,
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

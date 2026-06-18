import React from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;

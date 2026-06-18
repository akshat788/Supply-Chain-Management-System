import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f0f2f5" }}>
      <LockIcon sx={{ fontSize: 80, color: "#ef5350", mb: 2 }} />
      <Typography variant="h4" fontWeight="bold" color="#1a1a2e" mb={1}>Access Denied</Typography>
      <Typography color="text.secondary" mb={3}>You don't have permission to view this page.</Typography>
      <Button variant="contained" onClick={() => navigate(-1)}
        sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" }, borderRadius: 2 }}>
        Go Back
      </Button>
    </Box>
  );
};

export default Unauthorized;

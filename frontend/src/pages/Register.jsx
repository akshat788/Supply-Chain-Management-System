import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, CircularProgress, Grid,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    organization: "", phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "retailer", // Always retailer — no choice
        organization: form.organization,
        phone: form.phone,
      });
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      p: 2,
    }}>
      <Card sx={{ width: "100%", maxWidth: 480, borderRadius: 3, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="#1a1a2e">SCM System</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>Supply Chain Management</Typography>
          </Box>

          {/* Retailer Badge */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
            mb: 3, p: 1.5, backgroundColor: "#e8f5e9", borderRadius: 2 }}>
            <StorefrontIcon sx={{ color: "#66bb6a" }} />
            <Box>
              <Typography variant="body2" fontWeight={600} color="#66bb6a">Retailer Registration</Typography>
              <Typography variant="caption" color="text.secondary">
                For Supplier & Warehouse accounts, contact your administrator
              </Typography>
            </Box>
          </Box>

          <Typography variant="h6" fontWeight={600} mb={3} textAlign="center">
            Create Retailer Account
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Full Name *" name="name" size="small"
                  value={form.name} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email *" name="email" type="email" size="small"
                  value={form.email} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Organization" name="organization" size="small"
                  value={form.organization} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone" name="phone" size="small"
                  value={form.phone} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Password *" name="password" type="password" size="small"
                  value={form.password} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Confirm Password *" name="confirmPassword"
                  type="password" size="small"
                  value={form.confirmPassword} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" fullWidth variant="contained" size="large"
                  disabled={loading}
                  sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" },
                    borderRadius: 2, py: 1.5 }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
                </Button>
              </Grid>
            </Grid>
          </form>

          <Typography variant="body2" textAlign="center" mt={3} color="text.secondary">
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#0f3460", fontWeight: 600, textDecoration: "none" }}>
              Sign In
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../redux/authSlice";
import API from "../api/axios";
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, CircularProgress,
} from "@mui/material";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await API.post("/auth/login", form);
      dispatch(loginSuccess({ user: data.user, token: data.token }));

      // Redirect based on role
      const role = data.user.role;
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "supplier") navigate("/supplier/dashboard");
      else if (role === "warehouse_manager") navigate("/warehouse/dashboard");
      else if (role === "retailer") navigate("/retailer/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      }}
    >
      <Card sx={{ width: 400, borderRadius: 3, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" color="#1a1a2e">
              SCM System
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Supply Chain Management
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight={600} mb={3}>
            Sign in to your account
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email" name="email" type="email"
              value={form.email} onChange={handleChange}
              required sx={{ mb: 2 }} size="small"
            />
            <TextField
              fullWidth label="Password" name="password" type="password"
              value={form.password} onChange={handleChange}
              required sx={{ mb: 3 }} size="small"
            />
            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loading}
              sx={{
                backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" },
                borderRadius: 2, py: 1.5,
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>
          </form>

          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={3}>
            Contact your administrator to get an account.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;

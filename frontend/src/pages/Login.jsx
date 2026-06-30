import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginSuccess } from "../redux/authSlice";
import API from "../api/axios";
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, CircularProgress, Divider,
} from "@mui/material";
import logo from "../assets/logo.jpg";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await API.post("/auth/login", form);
      dispatch(loginSuccess({ user: data.user, token: data.token }));
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
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8fafc",
      position: "relative",
      overflow: "hidden",
      p: 2,
    }}>
      {/* Subtle Background Grid */}
      <Box sx={{
        position: "absolute", inset: 0, opacity: 0.05,
        backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        pointerEvents: "none"
      }} />

      <Card sx={{
        width: "100%",
        maxWidth: 420,
        borderRadius: "20px",
        boxShadow: "0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 10px 10px -5px rgba(15, 23, 42, 0.02)",
        border: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        zIndex: 2,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 25px 30px -5px rgba(15, 23, 42, 0.08)",
        }
      }}>
        <CardContent sx={{ p: { xs: 3.5, sm: 4.5 } }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <img src={logo} alt="SupplySync Logo" style={{ height: 64, marginBottom: 16, borderRadius: "6px" }} />
            <Typography variant="h5" fontWeight={900} color="#0f172a" sx={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.5px" }}>
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Enter your credentials to access your dashboard.
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: "8px" }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              sx={{
                mb: 2.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  "&.Mui-focused fieldset": {
                    borderColor: "#ea580c",
                  }
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#ea580c",
                }
              }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              sx={{
                mb: 3.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  "&.Mui-focused fieldset": {
                    borderColor: "#ea580c",
                  }
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#ea580c",
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                background: "linear-gradient(135deg, #ea580c, #f97316)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "15px",
                py: 1.4,
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(234, 88, 12, 0.2)",
                textTransform: "none",
                "&:hover": {
                  background: "linear-gradient(135deg, #d97706, #ea580c)",
                  boxShadow: "0 6px 16px rgba(234, 88, 12, 0.3)",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>
          </form>

          <Divider sx={{ my: 3.5, color: "#94a3b8", fontSize: "11px", fontWeight: 700, letterSpacing: "1px" }}>
            NEW TO THE NETWORK?
          </Divider>

          {/* Retailer signup link */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" mb={2} sx={{ fontSize: "13.5px" }}>
              Are you a Retailer client looking to place orders?
            </Typography>
            <Link to="/register" style={{ textDecoration: "none" }}>
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  borderColor: "#10b981",
                  color: "#047857",
                  fontWeight: 700,
                  fontSize: "14px",
                  borderRadius: "10px",
                  py: 1.2,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#047857",
                    backgroundColor: "#f0fdf4",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s",
                }}
              >
                Create Retailer Account
              </Button>
            </Link>
            <Typography variant="caption" color="text.secondary" display="block" mt={2.5} sx={{ fontStyle: "italic", lineHeight: 1.4 }}>
              Supplier & Warehouse accounts are created by your system administrator.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;

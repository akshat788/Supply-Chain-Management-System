import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, CircularProgress, Grid,
} from "@mui/material";
import logo from "../assets/logo.jpg";

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
        role: "retailer", // Always retailer
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
        maxWidth: 480,
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
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <img src={logo} alt="SupplySync Logo" style={{ height: 64, marginBottom: 16, borderRadius: "6px" }} />
            <Typography variant="h5" fontWeight={900} color="#0f172a" sx={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.5px" }}>
              Join the Network
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Register your retail store to manage stocks and place POs instantly.
            </Typography>
          </Box>

          {/* Info Badge */}
          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3.5,
            p: 2,
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "12px",
          }}>
            <span style={{ fontSize: 24 }}>🛍️</span>
            <Box>
              <Typography variant="body2" fontWeight={700} color="#15803d">
                Retailer Account Registration
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.2, lineHeight: 1.3 }}>
                Supplier & Warehouse managers accounts are created directly by the system administrator.
              </Typography>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: "8px" }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: "8px" }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  sx={{
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
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  sx={{
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Organization Name"
                  name="organization"
                  value={form.organization}
                  onChange={handleChange}
                  sx={{
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  sx={{
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  sx={{
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  sx={{
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
              </Grid>
              <Grid item xs={12} sx={{ mt: 1.5 }}>
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
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
                </Button>
              </Grid>
            </Grid>
          </form>

          <Typography variant="body2" textAlign="center" mt={4} color="text.secondary" sx={{ fontSize: "14px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#ea580c", fontWeight: 700, textDecoration: "none" }}>
              Sign In
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;

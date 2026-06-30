import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import Layout from "../components/Layout";
import API from "../api/axios";
import { getCleanName } from "../utils/sanitize";
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert, Grid, Avatar, Divider, Chip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LockIcon from "@mui/icons-material/Lock";

const roleColors = {
  admin: "error", supplier: "warning",
  warehouse_manager: "info", retailer: "success",
};

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    organization: user?.organization || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.put(`/users/${user._id}/profile`, profileForm);
      dispatch(loginSuccess({ user: data.user, token: localStorage.getItem("token") }));
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setError("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await API.put(`/users/${user._id}/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ fontFamily: "'Outfit', sans-serif" }}>My Profile</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Manage your account information</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2.5 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Grid container spacing={4}>
        {/* Profile Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{
            textAlign: "center",
            position: "relative",
            overflow: "visible",
            mt: 4,
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0, left: 0, right: 0, height: "100px",
              background: "linear-gradient(135deg, #0f172a, #1e293b)",
              borderRadius: "16px 16px 0 0",
              zIndex: 0
            }
          }}>
            <CardContent sx={{ p: 4, pt: 6, position: "relative", zIndex: 1 }}>
              <Avatar sx={{
                width: 100,
                height: 100,
                fontSize: 38,
                bgcolor: "secondary.main",
                mx: "auto",
                mb: 2.5,
                border: "4px solid #ffffff",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}>
                {getCleanName(user)?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" fontWeight={700} color="#0f172a" sx={{ fontFamily: "'Outfit', sans-serif" }}>
                {getCleanName(user)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{user?.email}</Typography>
              <Chip
                label={user?.role?.replace("_", " ")}
                color={roleColors[user?.role] || "default"}
                sx={{ textTransform: "capitalize", px: 1.5, py: 0.5, fontWeight: 700, mb: 3 }}
              />
              <Divider sx={{ mb: 2, borderColor: "#e2e8f0" }} />
              {[
                { label: "Organization", value: user?.organization || "—" },
                { label: "Phone", value: user?.phone || "—" },
                { label: "Member Since", value: new Date(user?.createdAt || Date.now()).toLocaleDateString() },
              ].map(item => (
                <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, borderBottom: "1px solid #f1f5f9", "&:last-child": { borderBottom: "none" } }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>{item.label}</Typography>
                  <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ textAlign: "right", ml: 2 }}>{item.value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          {/* Edit Profile */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={700} color="#0f172a" mb={3} sx={{ fontFamily: "'Outfit', sans-serif" }}>
                Edit Profile
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Full Name" size="small" fullWidth
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Phone" size="small" fullWidth
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Organization" size="small" fullWidth
                    value={profileForm.organization}
                    onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Email" size="small" fullWidth
                    value={user?.email} disabled
                    helperText="Email cannot be changed" />
                </Grid>
              </Grid>
              <Button variant="contained" startIcon={<SaveIcon />}
                onClick={handleProfileUpdate} disabled={loading}
                sx={{ mt: 3, px: 3, py: 1.2, borderRadius: 2 }}>
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={700} color="#0f172a" mb={3} sx={{ fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center" }}>
                <LockIcon sx={{ mr: 1, color: "secondary.main" }} />
                Change Password
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField label="Current Password" size="small" fullWidth type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="New Password" size="small" fullWidth type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Confirm New Password" size="small" fullWidth type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                </Grid>
              </Grid>
              <Button variant="outlined" startIcon={<LockIcon />}
                onClick={handlePasswordChange} disabled={loading}
                sx={{ mt: 3, px: 3, py: 1.2, borderRadius: 2, color: "primary.main", borderColor: "primary.main", "&:hover": { borderColor: "primary.dark", backgroundColor: "#f8fafc" } }}>
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Profile;

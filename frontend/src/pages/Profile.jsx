import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import Layout from "../components/Layout";
import API from "../api/axios";
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a1a2e">My Profile</Typography>
        <Typography variant="body2" color="text.secondary">Manage your account information</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <CardContent sx={{ p: 4 }}>
              <Avatar sx={{ width: 80, height: 80, fontSize: 32, bgcolor: "#1a1a2e", mx: "auto", mb: 2 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" fontWeight={600}>{user?.name}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>{user?.email}</Typography>
              <Chip
                label={user?.role?.replace("_", " ")}
                color={roleColors[user?.role] || "default"}
                sx={{ textTransform: "capitalize", mb: 2 }}
              />
              <Divider sx={{ my: 2 }} />
              {[
                { label: "Organization", value: user?.organization || "—" },
                { label: "Phone", value: user?.phone || "—" },
                { label: "Member Since", value: new Date(user?.createdAt || Date.now()).toLocaleDateString() },
              ].map(item => (
                <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                  <Typography variant="caption" fontWeight={500}>{item.value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {/* Edit Profile */}
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>Edit Profile</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Full Name" size="small" fullWidth
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Phone" size="small" fullWidth
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Organization" size="small" fullWidth
                    value={profileForm.organization}
                    onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Email" size="small" fullWidth
                    value={user?.email} disabled
                    helperText="Email cannot be changed" />
                </Grid>
              </Grid>
              <Button variant="contained" startIcon={<SaveIcon />}
                onClick={handleProfileUpdate} disabled={loading}
                sx={{ mt: 2, backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" }, borderRadius: 2 }}>
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <LockIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                Change Password
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField label="Current Password" size="small" fullWidth type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="New Password" size="small" fullWidth type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Confirm New Password" size="small" fullWidth type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                </Grid>
              </Grid>
              <Button variant="outlined" startIcon={<LockIcon />}
                onClick={handlePasswordChange} disabled={loading}
                sx={{ mt: 2, borderColor: "#1a1a2e", color: "#1a1a2e", borderRadius: 2 }}>
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

import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Alert, CircularProgress, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LockResetIcon from "@mui/icons-material/LockReset";

const roleColors = {
  admin: "error", supplier: "warning",
  warehouse_manager: "info", retailer: "success",
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [createForm, setCreateForm] = useState({
    name: "", email: "", password: "",
    role: "retailer", organization: "", phone: "",
  });

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/users");
      setUsers(data.users);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this user?")) return;
    try {
      await API.delete(`/users/${id}`);
      setSuccess("User deactivated successfully!");
      fetchUsers();
    } catch {
      setError("Failed to deactivate user.");
    }
  };

  const handleResetPassword = async () => {
    try {
      await API.put(`/users/${selectedUser._id}/password`, { password: newPassword });
      setSuccess("Password reset successfully!");
      setPasswordOpen(false);
      setNewPassword("");
    } catch {
      setError("Failed to reset password.");
    }
  };

  const handleCreateUser = async () => {
    try {
      await API.post("/users", createForm);
      setSuccess(`User ${createForm.name} created successfully!`);
      setCreateOpen(false);
      setCreateForm({ name: "", email: "", password: "", role: "retailer", organization: "", phone: "" });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user.");
    }
  };

  // Role counts
  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <Layout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Users</Typography>
          <Typography variant="body2" color="text.secondary">Manage all system users</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}
          sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" }, borderRadius: 2 }}>
          Create User
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {/* Role Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { role: "admin", label: "Admins", color: "#ef5350" },
          { role: "supplier", label: "Suppliers", color: "#ffa726" },
          { role: "warehouse_manager", label: "Warehouse", color: "#4fc3f7" },
          { role: "retailer", label: "Retailers", color: "#66bb6a" },
        ].map(item => (
          <Grid item xs={6} md={3} key={item.role}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", textAlign: "center" }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h4" fontWeight="bold" color={item.color}>
                  {roleCounts[item.role] || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableRow>
                    {["User", "Email", "Role", "Organization", "Phone", "Status", "Joined", "Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: "#1a1a2e" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map(u => (
                      <TableRow key={u._id} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: "#1a1a2e" }}>
                              {u.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" fontWeight={500}>{u.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Chip label={u.role?.replace("_", " ")} size="small"
                            color={roleColors[u.role] || "default"} sx={{ textTransform: "capitalize" }} />
                        </TableCell>
                        <TableCell>{u.organization || "—"}</TableCell>
                        <TableCell>{u.phone || "—"}</TableCell>
                        <TableCell>
                          <Chip label={u.isActive ? "Active" : "Inactive"} size="small"
                            color={u.isActive ? "success" : "error"} />
                        </TableCell>
                        <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary" title="Reset Password"
                            onClick={() => { setSelectedUser(u); setPasswordOpen(true); }}>
                            <LockResetIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" title="Deactivate"
                            onClick={() => handleDelete(u._id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={600}>Create New User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Full Name *" size="small" fullWidth
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Email *" size="small" fullWidth type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Password *" size="small" fullWidth type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Role *</InputLabel>
                  <Select
                    value={createForm.role}
                    label="Role *"
                    MenuProps={{
                      style: { zIndex: 1600 },
                    }}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, role: e.target.value })
                    }
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="supplier">Supplier</MenuItem>
                    <MenuItem value="warehouse_manager">Warehouse Manager</MenuItem>
                    <MenuItem value="retailer">Retailer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Organization" size="small" fullWidth
                  value={createForm.organization}
                  onChange={(e) => setCreateForm({ ...createForm, organization: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Phone" size="small" fullWidth
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateUser}
            disabled={!createForm.name || !createForm.email || !createForm.password}
            sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" } }}>
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={passwordOpen} onClose={() => setPasswordOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={600}>Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Reset password for <strong>{selectedUser?.name}</strong>
          </Typography>
          <TextField label="New Password" type="password" size="small" fullWidth
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setPasswordOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleResetPassword}
            disabled={!newPassword || newPassword.length < 6}
            sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" } }}>
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Users;

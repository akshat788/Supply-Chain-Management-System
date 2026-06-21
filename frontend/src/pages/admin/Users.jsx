import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Alert, CircularProgress, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");

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

  const getLastLogin = (date) => {
    if (!date) return "Never";
    const diff = Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return `${diff} days ago`;
  };

  return (
    <Layout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Users</Typography>
        <Typography variant="body2" color="text.secondary">Manage all system users</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableRow>
                    {["User", "Email", "Role", "Organization", "Status", "Joined", "Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: "#1a1a2e" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>No users found.</TableCell>
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
                        <TableCell>
                          <Chip label={u.isActive ? "Active" : "Inactive"} size="small"
                            color={u.isActive ? "success" : "error"} />
                        </TableCell>
                        <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary"
                            title="Reset Password"
                            onClick={() => { setSelectedUser(u); setPasswordOpen(true); }}>
                            <LockResetIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error"
                            title="Deactivate User"
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

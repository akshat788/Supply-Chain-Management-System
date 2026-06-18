import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, CircularProgress, IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", contactPerson: "", email: "",
    phone: "", location: "", products: "",
  });

  const fetchSuppliers = async () => {
    try {
      const { data } = await API.get("/suppliers");
      setSuppliers(data.suppliers);
    } catch {
      setError("Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleSubmit = async () => {
    try {
      await API.post("/suppliers", {
        ...form,
        products: form.products.split(",").map((p) => p.trim()),
      });
      setSuccess("Supplier added successfully!");
      setOpen(false);
      setForm({ name: "", contactPerson: "", email: "", phone: "", location: "", products: "" });
      fetchSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add supplier.");
    }
  };

  return (
    <Layout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Suppliers</Typography>
          <Typography variant="body2" color="text.secondary">Manage your supplier network</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}
          sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" }, borderRadius: 2 }}>
          Add Supplier
        </Button>
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
                    {["Code", "Name", "Contact", "Email", "Location", "Score", "Actions"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: "#1a1a2e" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {suppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No suppliers found. Add your first supplier.
                      </TableCell>
                    </TableRow>
                  ) : (
                    suppliers.map((s) => (
                      <TableRow key={s._id} hover>
                        <TableCell><Chip label={s.supplierCode} size="small" /></TableCell>
                        <TableCell fontWeight={500}>{s.name}</TableCell>
                        <TableCell>{s.contactPerson}</TableCell>
                        <TableCell>{s.email}</TableCell>
                        <TableCell>{s.location}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${s.performanceScore}%`} size="small"
                            color={s.performanceScore >= 90 ? "success" : s.performanceScore >= 70 ? "warning" : "error"}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
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

      {/* Add Supplier Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={600}>Add New Supplier</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {[
              { label: "Supplier Name *", name: "name" },
              { label: "Contact Person", name: "contactPerson" },
              { label: "Email", name: "email" },
              { label: "Phone", name: "phone" },
              { label: "Location", name: "location" },
              { label: "Products (comma separated)", name: "products" },
            ].map((field) => (
              <TextField
                key={field.name} label={field.label} size="small" fullWidth
                value={form[field.name]}
                onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}
            sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" } }}>
            Add Supplier
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Suppliers;

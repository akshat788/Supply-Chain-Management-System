import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, CircularProgress, IconButton,
  InputAdornment, MenuItem, Select, FormControl, InputLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [form, setForm] = useState({
    name: "", contactPerson: "", email: "",
    phone: "", location: "", products: "",
  });

  const fetchSuppliers = async () => {
    try {
      const { data } = await API.get("/suppliers");
      setSuppliers(data.suppliers);
      setFiltered(data.suppliers);
    } catch {
      setError("Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  useEffect(() => {
    let result = suppliers;
    if (search) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.location?.toLowerCase().includes(search.toLowerCase()) ||
        s.contactPerson?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (scoreFilter === "excellent") result = result.filter(s => s.performanceScore >= 90);
    else if (scoreFilter === "good") result = result.filter(s => s.performanceScore >= 70 && s.performanceScore < 90);
    else if (scoreFilter === "poor") result = result.filter(s => s.performanceScore < 70);
    setFiltered(result);
  }, [search, scoreFilter, suppliers]);

  const handleOpen = (supplier = null) => {
    if (supplier) {
      setEditId(supplier._id);
      setForm({
        name: supplier.name || "", contactPerson: supplier.contactPerson || "",
        email: supplier.email || "", phone: supplier.phone || "",
        location: supplier.location || "", products: supplier.products?.join(", ") || "",
      });
    } else {
      setEditId(null);
      setForm({ name: "", contactPerson: "", email: "", phone: "", location: "", products: "" });
    }
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form, products: form.products.split(",").map(p => p.trim()).filter(Boolean) };
      if (editId) {
        await API.put(`/suppliers/${editId}`, payload);
        setSuccess("Supplier updated successfully!");
      } else {
        await API.post("/suppliers", payload);
        setSuccess("Supplier added successfully!");
      }
      setOpen(false);
      setEditId(null);
      setForm({ name: "", contactPerson: "", email: "", phone: "", location: "", products: "" });
      fetchSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save supplier.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await API.delete(`/suppliers/${id}`);
      setSuccess("Supplier deleted successfully!");
      fetchSuppliers();
    } catch (err) {
      setError("Failed to delete supplier.");
    }
  };

  return (
    <Layout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Suppliers</Typography>
          <Typography variant="body2" color="text.secondary">Manage your supplier network</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}
          sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" }, borderRadius: 2 }}>
          Add Supplier
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {/* Search & Filter */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField placeholder="Search supplier..." size="small" sx={{ flex: 1, backgroundColor: "#fff", borderRadius: 2 }}
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Performance</InputLabel>
          <Select value={scoreFilter} label="Performance" onChange={(e) => setScoreFilter(e.target.value)}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="excellent">Excellent (90%+)</MenuItem>
            <MenuItem value="good">Good (70-90%)</MenuItem>
            <MenuItem value="poor">Poor (below 70%)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableRow>
                    {["Code", "Name", "Contact", "Location", "Products", "Score", "Actions"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: "#1a1a2e" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No suppliers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(s => (
                      <TableRow key={s._id} hover>
                        <TableCell><Chip label={s.supplierCode} size="small" /></TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{s.name}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{s.contactPerson}</Typography>
                          <Typography variant="caption" color="text.secondary">{s.email}</Typography>
                        </TableCell>
                        <TableCell>{s.location}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                            {s.products?.slice(0, 2).map((p, i) => (
                              <Chip key={i} label={p} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                            ))}
                            {s.products?.length > 2 && <Chip label={`+${s.products.length - 2}`} size="small" />}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={`${s.performanceScore}%`} size="small"
                            color={s.performanceScore >= 90 ? "success" : s.performanceScore >= 70 ? "warning" : "error"} />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="info" onClick={() => { setSelectedSupplier(s); setViewOpen(true); }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="primary" onClick={() => handleOpen(s)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(s._id)}>
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

      {/* View Supplier Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={600}>Supplier Details</DialogTitle>
        <DialogContent>
          {selectedSupplier && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              {[
                { label: "Supplier Code", value: selectedSupplier.supplierCode },
                { label: "Name", value: selectedSupplier.name },
                { label: "Contact Person", value: selectedSupplier.contactPerson || "—" },
                { label: "Email", value: selectedSupplier.email || "—" },
                { label: "Phone", value: selectedSupplier.phone || "—" },
                { label: "Location", value: selectedSupplier.location || "—" },
                { label: "Products", value: selectedSupplier.products?.join(", ") || "—" },
                { label: "Performance Score", value: `${selectedSupplier.performanceScore}%` },
                { label: "On-Time Delivery", value: `${selectedSupplier.onTimeDelivery}%` },
                { label: "Quality Score", value: `${selectedSupplier.qualityScore}%` },
              ].map(item => (
                <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", py: 1, borderBottom: "1px solid #f0f0f0" }}>
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  <Typography variant="body2" fontWeight={500}>{item.value}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add / Edit Supplier Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={600}>{editId ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {[
              { label: "Supplier Name *", name: "name" },
              { label: "Contact Person", name: "contactPerson" },
              { label: "Email", name: "email" },
              { label: "Phone", name: "phone" },
              { label: "Location", name: "location" },
              { label: "Products (comma separated)", name: "products" },
            ].map(field => (
              <TextField key={field.name} label={field.label} size="small" fullWidth
                value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}
            sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" } }}>
            {editId ? "Update Supplier" : "Add Supplier"}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Suppliers;

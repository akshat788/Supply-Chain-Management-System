import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, updateQuantity, clearCart } from "../../redux/cartSlice";
import {
  Box, Card, CardContent, Typography, Grid, Chip,
  Alert, CircularProgress, TextField, InputAdornment,
  Button, IconButton, Badge, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select,
  FormControl, InputLabel, Snackbar, Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CategoryIcon from "@mui/icons-material/Category";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";

const categories = ["All", "Electronics", "Fashion", "Food", "Pharmaceutical", "Furniture", "Other"];
const sortOptions = [
  { value: "default", label: "Default" },
  { value: "price_low", label: "Price: Low → High" },
  { value: "price_high", label: "Price: High → Low" },
  { value: "newest", label: "Newest" },
];

const categoryColors = {
  Electronics: "#4fc3f7", Fashion: "#ce93d8", Food: "#81c784",
  Pharmaceutical: "#ffb74d", Furniture: "#4db6ac", Other: "#90a4ae",
};

const RetailerProducts = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, invRes] = await Promise.all([
          API.get("/products"),
          API.get("/inventory"),
        ]);
        setProducts(prodRes.data.products);
        setFiltered(prodRes.data.products);
        setInventory(invRes.data.inventory);
      } catch {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...products];
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (category !== "All") result = result.filter(p => p.category === category);
    if (sort === "price_low") result.sort((a, b) => a.sellingPrice - b.sellingPrice);
    else if (sort === "price_high") result.sort((a, b) => b.sellingPrice - a.sellingPrice);
    else if (sort === "newest") result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFiltered(result);
  }, [search, category, sort, products]);

  const getStock = (productId) => {
    const inv = inventory.find(i => i.product?._id === productId);
    return inv ? inv.availableStock : 0;
  };

  const getCartQty = (productId) => {
    const item = cartItems.find(i => i.product._id === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product) => {
    const stock = getStock(product._id);
    if (stock === 0) return;
    dispatch(addToCart({ product, quantity: 1, unitPrice: product.sellingPrice }));
    setSuccess(`${product.name} added to cart!`);
  };

  const cartTotal = cartItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const handleCheckout = async () => {
    if (!shippingAddress) { setError("Please enter shipping address."); return; }
    setCheckoutLoading(true);
    try {
      await API.post("/orders", {
        items: cartItems.map(i => ({ product: i.product._id, quantity: i.quantity, unitPrice: i.unitPrice })),
        shippingAddress,
      });
      dispatch(clearCart());
      setCheckoutOpen(false);
      setCartOpen(false);
      setSuccess("Order placed successfully! 🎉");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="#1a1a2e">Products</Typography>
          <Typography variant="body2" color="text.secondary">Browse and add products to your cart</Typography>
        </Box>
        <Badge badgeContent={cartItems.length} color="error">
          <Button variant="contained" startIcon={<ShoppingCartIcon />}
            onClick={() => setCartOpen(true)}
            sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" }, borderRadius: 2 }}>
            Cart {cartItems.length > 0 && `(₹${cartTotal.toLocaleString()})`}
          </Button>
        </Badge>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {/* Search + Filter + Sort */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <TextField fullWidth placeholder="Search products..." size="small"
            sx={{ backgroundColor: "#fff", borderRadius: 2 }}
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
        </Grid>
        <Grid item xs={6} md={4}>
          <FormControl size="small" fullWidth>
            <InputLabel>Category</InputLabel>
            <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
              {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select value={sort} label="Sort By" onChange={(e) => setSort(e.target.value)}>
              {sortOptions.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="text.secondary" textAlign="center" py={4}>No products found.</Typography>
            </Grid>
          ) : (
            filtered.map(p => {
              const stock = getStock(p._id);
              const cartQty = getCartQty(p._id);
              const isOutOfStock = stock === 0;
              return (
                <Grid item xs={12} sm={6} md={4} key={p._id}>
                  <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%",
                    display: "flex", flexDirection: "column",
                    "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.15)", transform: "translateY(-2px)" },
                    transition: "all 0.2s ease",
                    opacity: isOutOfStock ? 0.7 : 1,
                  }}>
                    <CardContent sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Box sx={{ p: 1, borderRadius: 2, backgroundColor: `${categoryColors[p.category] || "#90a4ae"}20` }}>
                          <CategoryIcon sx={{ color: categoryColors[p.category] || "#90a4ae" }} />
                        </Box>
                        <Chip label={p.category} size="small"
                          sx={{ backgroundColor: `${categoryColors[p.category] || "#90a4ae"}20`, color: categoryColors[p.category] || "#90a4ae" }} />
                      </Box>

                      <Typography variant="h6" fontWeight={600} mb={0.5}>{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        SKU: {p.sku} • Unit: {p.unit}
                      </Typography>

                      {p.description && (
                        <Typography variant="body2" color="text.secondary" mb={1.5}
                          sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.description}
                        </Typography>
                      )}

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                        pt: 1.5, borderTop: "1px solid #f0f0f0", mb: 1 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Price</Typography>
                          <Typography variant="h6" fontWeight="bold" color="#1a1a2e">
                            ₹{p.sellingPrice?.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography variant="caption" color="text.secondary">Available</Typography>
                          <Typography variant="body2" fontWeight={600}
                            color={stock === 0 ? "error" : stock <= 50 ? "#ffa726" : "#66bb6a"}>
                            {stock === 0 ? "Out of Stock" : `${stock} ${p.unit}`}
                          </Typography>
                        </Box>
                      </Box>

                      {p.supplier?.name && (
                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                          Supplier: {p.supplier.name}
                        </Typography>
                      )}
                    </CardContent>

                    <Box sx={{ p: 2, pt: 0 }}>
                      {cartQty > 0 ? (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                          border: "1px solid #1a1a2e", borderRadius: 2, px: 1 }}>
                          <IconButton size="small" onClick={() => {
                            if (cartQty === 1) dispatch(removeFromCart(p._id));
                            else dispatch(updateQuantity({ productId: p._id, quantity: cartQty - 1 }));
                          }}><RemoveIcon fontSize="small" /></IconButton>
                          <Typography fontWeight={600}>{cartQty}</Typography>
                          <IconButton size="small" onClick={() => dispatch(updateQuantity({ productId: p._id, quantity: cartQty + 1 }))}>
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Button fullWidth variant="contained" disabled={isOutOfStock}
                          startIcon={<ShoppingCartIcon />} onClick={() => handleAddToCart(p)}
                          sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" }, borderRadius: 2 }}>
                          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        </Button>
                      )}
                    </Box>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      )}

      {/* Cart Dialog */}
      <Dialog open={cartOpen} onClose={() => setCartOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={600}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" fontWeight={600}>Your Cart</Typography>
            <Chip label={`${cartItems.length} items`} size="small" />
          </Box>
        </DialogTitle>
        <DialogContent>
          {cartItems.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <ShoppingCartIcon sx={{ fontSize: 64, color: "#e0e0e0" }} />
              <Typography color="text.secondary" mt={1}>Your cart is empty</Typography>
            </Box>
          ) : (
            <Box>
              {cartItems.map(item => (
                <Box key={item.product._id} sx={{ display: "flex", justifyContent: "space-between",
                  alignItems: "center", py: 1.5, borderBottom: "1px solid #f0f0f0" }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>{item.product.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ₹{item.unitPrice?.toLocaleString()} × {item.quantity}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography fontWeight={600} color="#1a1a2e">
                      ₹{(item.quantity * item.unitPrice).toLocaleString()}
                    </Typography>
                    <IconButton size="small" color="error"
                      onClick={() => dispatch(removeFromCart(item.product._id))}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" fontWeight={600}>Total</Typography>
                <Typography variant="h6" fontWeight={600} color="#1a1a2e">
                  ₹{cartTotal.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, flexDirection: "column", gap: 1 }}>
          {cartItems.length > 0 && (
            <Button fullWidth variant="contained" size="large"
              onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
              sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" }, borderRadius: 2 }}>
              Proceed to Checkout
            </Button>
          )}
          <Button fullWidth variant="outlined" onClick={() => setCartOpen(false)} sx={{ borderRadius: 2 }}>
            Continue Shopping
          </Button>
        </DialogActions>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={600}>Checkout</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            {cartItems.map(item => (
              <Box key={item.product._id} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                <Typography variant="body2">{item.product.name} × {item.quantity}</Typography>
                <Typography variant="body2" fontWeight={500}>₹{(item.quantity * item.unitPrice).toLocaleString()}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography fontWeight={600}>Total</Typography>
              <Typography fontWeight={600} color="#1a1a2e">₹{cartTotal.toLocaleString()}</Typography>
            </Box>
            <TextField fullWidth label="Shipping Address *" size="small" multiline rows={2}
              value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCheckoutOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCheckout} disabled={checkoutLoading}
            sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" } }}>
            {checkoutLoading ? "Placing Order..." : "Place Order"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess("")}
        message={success} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
    </Layout>
  );
};

export default RetailerProducts;

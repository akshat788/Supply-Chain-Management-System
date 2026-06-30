import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, updateQuantity, clearCart } from "../../redux/cartSlice";
import {
  Box, Card, CardContent, Typography, Grid, Chip,
  Alert, CircularProgress, TextField, InputAdornment,
  Button, IconButton, Badge, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select,
  FormControl, InputLabel, Snackbar, Divider, Drawer, LinearProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CategoryIcon from "@mui/icons-material/Category";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";

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
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get("search") || "";

  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState(querySearch);

  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);
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

      {/* Category Quick Filters */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap", overflowX: "auto", py: 0.5 }}>
        {categories.map(c => {
          const isSelected = category === c;
          return (
            <Chip
              key={c}
              label={c}
              onClick={() => setCategory(c)}
              icon={c !== "All" ? <CategoryIcon style={{ color: isSelected ? "#fff" : categoryColors[c] }} /> : undefined}
              sx={{
                px: 1.5,
                py: 2,
                fontSize: "13px",
                fontWeight: isSelected ? 700 : 500,
                backgroundColor: isSelected ? "#1a1a2e" : "#f1f5f9",
                color: isSelected ? "#fff" : "#475569",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: isSelected ? "#1a1a2e" : "transparent",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: isSelected ? "#1a1a2e" : "#e2e8f0",
                  transform: "translateY(-1px)",
                },
                "& .MuiChip-icon": {
                  color: isSelected ? "#fff !important" : "inherit"
                }
              }}
            />
          );
        })}
      </Box>

      {/* Search + Sort */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField fullWidth placeholder="Search products..." size="small"
            sx={{ backgroundColor: "#fff", borderRadius: 2 }}
            value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
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
            <Grid size={{ xs: 12 }}>
              <Typography color="text.secondary" textAlign="center" py={4}>No products found.</Typography>
            </Grid>
          ) : (
            filtered.map(p => {
              const stock = getStock(p._id);
              const cartQty = getCartQty(p._id);
              const isOutOfStock = stock === 0;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p._id}>
                  <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%",
                    display: "flex", flexDirection: "column",
                    "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.12)", transform: "translateY(-4px)" },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    opacity: isOutOfStock ? 0.75 : 1,
                  }}>
                    {/* Visual Card Header Gradient */}
                    <Box sx={{
                      height: 110,
                      background: `linear-gradient(135deg, ${categoryColors[p.category] || "#90a4ae"}25, ${categoryColors[p.category] || "#90a4ae"}05)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                    }}>
                      <CategoryIcon sx={{ fontSize: 44, color: categoryColors[p.category] || "#90a4ae" }} />
                      <Chip label={p.category} size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          backgroundColor: `${categoryColors[p.category] || "#90a4ae"}20`,
                          color: categoryColors[p.category] || "#90a4ae",
                          fontWeight: 700,
                          fontSize: "11px"
                        }}
                      />
                    </Box>

                    <CardContent sx={{ flex: 1, p: 2.5 }}>
                      {/* Rating */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                        <StarIcon sx={{ color: "#f59e0b", fontSize: 16 }} />
                        <Typography variant="caption" fontWeight={700} color="#f59e0b">
                          {(4.0 + (p.name.length % 10) / 10).toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({10 + (p.name.length * 3) % 40} reviews)
                        </Typography>
                      </Box>

                      <Typography variant="h6" fontWeight={700} color="#1a1a2e" mb={0.5} sx={{ fontSize: "16px", lineHeight: 1.3 }}>
                        {p.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                        SKU: {p.sku} • Unit: {p.unit}
                      </Typography>

                      {p.description && (
                        <Typography variant="body2" color="text.secondary" mb={2}
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            minHeight: "40px",
                            lineHeight: 1.4
                          }}>
                          {p.description}
                        </Typography>
                      )}

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                        pt: 1.5, borderTop: "1px solid #f1f5f9", mb: 1.5 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Price</Typography>
                          <Typography variant="h6" fontWeight="bold" color="#1a1a2e" sx={{ fontSize: "18px" }}>
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

                      {/* Stock Warning Progress Bar */}
                      {stock > 0 && stock <= 50 && (
                        <Box sx={{ mb: 1.5 }}>
                          <LinearProgress variant="determinate" value={(stock / 100) * 100}
                            sx={{ height: 4, borderRadius: 2, backgroundColor: "#fee2e2",
                              "& .MuiLinearProgress-bar": { backgroundColor: "#ef6c00" } }} />
                          <Typography variant="caption" color="#e65100" sx={{ display: "block", mt: 0.5, fontSize: "10.5px", fontWeight: 700 }}>
                            🔥 Running Low! Only {stock} remaining.
                          </Typography>
                        </Box>
                      )}

                      {p.supplier?.name && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Supplier: <strong>{p.supplier.name}</strong>
                        </Typography>
                      )}
                    </CardContent>

                    <Box sx={{ p: 2, pt: 0 }}>
                      {cartQty > 0 ? (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                          border: "1px solid #1a1a2e", borderRadius: 2, px: 1, py: 0.5 }}>
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
                          sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" }, borderRadius: 2, textTransform: "none", py: 1, fontWeight: 600 }}>
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

      {/* Cart Drawer */}
      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)} sx={{ "& .MuiDrawer-paper": { width: { xs: "100%", sm: 420 }, p: 3, display: "flex", flexDirection: "column" } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" fontWeight={700} color="#1a1a2e">Your Shopping Cart</Typography>
          <Chip label={`${cartItems.length} items`} size="small" sx={{ backgroundColor: "rgba(26, 26, 46, 0.1)", fontWeight: 700 }} />
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 2 }}>
          {cartItems.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <ShoppingCartIcon sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
              <Typography color="text.secondary" fontWeight={500}>Your cart is currently empty.</Typography>
            </Box>
          ) : (
            cartItems.map(item => (
              <Box key={item.product._id} sx={{ display: "flex", justifyContent: "space-between",
                alignItems: "center", py: 2, borderBottom: "1px solid #f1f5f9" }}>
                <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>{item.product.name}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    ₹{item.unitPrice?.toLocaleString()} each
                  </Typography>
                  
                  {/* Inline Qty Controls */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                    <IconButton size="small" onClick={() => {
                      if (item.quantity === 1) dispatch(removeFromCart(item.product._id));
                      else dispatch(updateQuantity({ productId: item.product._id, quantity: item.quantity - 1 }));
                    }} sx={{ border: "1px solid #e2e8f0", p: 0.25 }}><RemoveIcon fontSize="inherit" /></IconButton>
                    <Typography variant="body2" fontWeight={700}>{item.quantity}</Typography>
                    <IconButton size="small" onClick={() => dispatch(updateQuantity({ productId: item.product._id, quantity: item.quantity + 1 }))} sx={{ border: "1px solid #e2e8f0", p: 0.25 }}><AddIcon fontSize="inherit" /></IconButton>
                  </Box>
                </Box>
                
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography fontWeight={700} color="#1a1a2e">
                    ₹{(item.quantity * item.unitPrice).toLocaleString()}
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => dispatch(removeFromCart(item.product._id))}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))
          )}
        </Box>

        {cartItems.length > 0 && (
          <Box sx={{ borderTop: "1px solid #e2e8f0", pt: 2, mt: "auto" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={700}>Subtotal</Typography>
              <Typography variant="h6" fontWeight={700} color="#1a1a2e">
                ₹{cartTotal.toLocaleString()}
              </Typography>
            </Box>
            
            <Button fullWidth variant="contained" size="large"
              onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
              sx={{ backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#0f3460" }, borderRadius: 2, mb: 1, py: 1.5, fontWeight: 700, textTransform: "none" }}>
              Proceed to Checkout
            </Button>
          </Box>
        )}
        
        <Button fullWidth variant="outlined" onClick={() => setCartOpen(false)} sx={{ borderRadius: 2, py: 1.2, fontWeight: 600, textTransform: "none", borderColor: "#cbd5e1", color: "#475569" }}>
          Continue Shopping
        </Button>
      </Drawer>


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

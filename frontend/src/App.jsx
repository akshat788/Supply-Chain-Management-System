import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import PrivateRoute from "./components/PrivateRoute";

// Pages
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import Suppliers from "./pages/admin/Suppliers";
import Inventory from "./pages/admin/Inventory";

// Retailer pages
import RetailerDashboard from "./pages/retailer/RetailerDashboard";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>
          } />
          <Route path="/admin/suppliers" element={
            <PrivateRoute roles={["admin"]}><Suppliers /></PrivateRoute>
          } />
          <Route path="/admin/inventory" element={
            <PrivateRoute roles={["admin", "warehouse_manager"]}><Inventory /></PrivateRoute>
          } />

          {/* Retailer routes */}
          <Route path="/retailer/dashboard" element={
            <PrivateRoute roles={["retailer"]}><RetailerDashboard /></PrivateRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;

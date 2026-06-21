import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import PrivateRoute from "./components/PrivateRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Suppliers from "./pages/admin/Suppliers";
import Inventory from "./pages/admin/Inventory";
import Products from "./pages/admin/Products";
import PurchaseOrders from "./pages/admin/PurchaseOrders";
import Orders from "./pages/admin/Orders";
import Analytics from "./pages/admin/Analytics";
import Users from "./pages/admin/Users";
import SupplyChainTracking from "./pages/admin/SupplyChainTracking";

import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import SupplierProducts from "./pages/supplier/SupplierProducts";
import SupplierPurchaseOrders from "./pages/supplier/SupplierPurchaseOrders";

import WarehouseDashboard from "./pages/warehouse/WarehouseDashboard";
import WarehouseInventory from "./pages/warehouse/WarehouseInventory";
import WarehouseOrders from "./pages/warehouse/WarehouseOrders";
import WarehousePurchaseOrders from "./pages/warehouse/WarehousePurchaseOrders";

import RetailerDashboard from "./pages/retailer/RetailerDashboard";
import RetailerOrders from "./pages/retailer/RetailerOrders";
import RetailerProducts from "./pages/retailer/RetailerProducts";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/admin/dashboard" element={<PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/suppliers" element={<PrivateRoute roles={["admin"]}><Suppliers /></PrivateRoute>} />
          <Route path="/admin/products" element={<PrivateRoute roles={["admin"]}><Products /></PrivateRoute>} />
          <Route path="/admin/inventory" element={<PrivateRoute roles={["admin", "warehouse_manager"]}><Inventory /></PrivateRoute>} />
          <Route path="/admin/purchase-orders" element={<PrivateRoute roles={["admin", "warehouse_manager"]}><PurchaseOrders /></PrivateRoute>} />
          <Route path="/admin/orders" element={<PrivateRoute roles={["admin", "warehouse_manager"]}><Orders /></PrivateRoute>} />
          <Route path="/admin/analytics" element={<PrivateRoute roles={["admin"]}><Analytics /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={["admin"]}><Users /></PrivateRoute>} />
          <Route path="/admin/tracking" element={<PrivateRoute roles={["admin"]}><SupplyChainTracking /></PrivateRoute>} />

          <Route path="/supplier/dashboard" element={<PrivateRoute roles={["supplier"]}><SupplierDashboard /></PrivateRoute>} />
          <Route path="/supplier/products" element={<PrivateRoute roles={["supplier"]}><SupplierProducts /></PrivateRoute>} />
          <Route path="/supplier/purchase-orders" element={<PrivateRoute roles={["supplier"]}><SupplierPurchaseOrders /></PrivateRoute>} />

          <Route path="/warehouse/dashboard" element={<PrivateRoute roles={["warehouse_manager"]}><WarehouseDashboard /></PrivateRoute>} />
          <Route path="/warehouse/inventory" element={<PrivateRoute roles={["warehouse_manager"]}><WarehouseInventory /></PrivateRoute>} />
          <Route path="/warehouse/orders" element={<PrivateRoute roles={["warehouse_manager"]}><WarehouseOrders /></PrivateRoute>} />
          <Route path="/warehouse/purchase-orders" element={<PrivateRoute roles={["warehouse_manager"]}><WarehousePurchaseOrders /></PrivateRoute>} />

          <Route path="/retailer/dashboard" element={<PrivateRoute roles={["retailer"]}><RetailerDashboard /></PrivateRoute>} />
          <Route path="/retailer/products" element={<PrivateRoute roles={["retailer"]}><RetailerProducts /></PrivateRoute>} />
          <Route path="/retailer/orders" element={<PrivateRoute roles={["retailer"]}><RetailerOrders /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;

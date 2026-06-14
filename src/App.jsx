import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/admin/Login';
import DashboardLayout from './components/DashboardLayout';
import Settings from './pages/admin/Settings';
import QRStation from './pages/admin/QRStation';
import MenuManager from './pages/admin/MenuManager';
import LiveOrders from './pages/admin/LiveOrders';
import CashierPOS from './pages/admin/CashierPOS';
import Analytics from './pages/admin/Analytics';

// Public Phase 4 Imports
import MenuOrder from './pages/public/MenuOrder';
import Checkout from './pages/public/Checkout';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

// Placeholder components for the dashboard tabs
const Placeholder = ({ title }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-crmText">{title}</h1>
    <p className="text-gray-400 mt-2">This module is under construction.</p>
  </div>
);

import Landing from './pages/public/Landing';
import Book from './pages/public/Book';
import Reservations from './pages/admin/Reservations';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Customer Routes */}
      <Route path="/order" element={<MenuOrder />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/book" element={<Book />} />
      <Route path="/" element={<Landing />} />
      
      {/* Admin CRM Routes */}
      <Route path="/login" element={<Login />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard/analytics" replace />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="live-orders" element={<LiveOrders />} />
        <Route path="pos" element={<CashierPOS />} />
        <Route path="menu" element={<MenuManager />} />
        <Route path="qr" element={<QRStation />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

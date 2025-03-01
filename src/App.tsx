
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import ChannelDetails from './pages/ChannelDetails';
import ChannelTypes from './pages/ChannelTypes';
import ChannelTypeDetails from './pages/ChannelTypeDetails';
import AdminLogin from './pages/Admin/AdminLogin';
import Dashboard from './pages/Admin/Dashboard';
import AddChannel from './pages/Admin/AddChannel';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster";
import ManageChannelTypes from "./pages/Admin/ManageChannelTypes";
import Calculator from './pages/Calculator';
import ChannelEarnings from './pages/ChannelEarnings';

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/channel/:id" element={<ChannelDetails />} />
        <Route path="/channel-types" element={<ChannelTypes />} />
        <Route path="/channel-types/:typeId" element={<ChannelTypeDetails />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/channel-earnings" element={<ChannelEarnings />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/add-channel"
          element={
            <ProtectedRoute>
              <AddChannel />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/channel-types"
          element={
            <ProtectedRoute>
              <ManageChannelTypes />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;

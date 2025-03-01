
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "./components/theme-provider";
import Index from './pages/Index';
import ChannelDetails from './pages/ChannelDetails';
import ChannelTypes from './pages/ChannelTypes';
import ChannelTypeDetails from './pages/ChannelTypeDetails';
import AdminLogin from './pages/Admin/AdminLogin';
import Dashboard from './pages/Admin/Dashboard';
import AddChannel from './pages/Admin/AddChannel';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster";

// Import our new component
import ManageChannelTypes from "./pages/Admin/ManageChannelTypes";

function App() {
  // You can add any global state or context here if needed

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="light">
          <Toaster />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/channel/:id" element={<ChannelDetails />} />
            <Route path="/channel-types" element={<ChannelTypes />} />
            <Route path="/channel-types/:typeId" element={<ChannelTypeDetails />} />
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
            
            {/* Add the route for managing channel types */}
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
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

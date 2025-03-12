
import React from 'react';
import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Import components directly instead of using dynamic imports within the routes
import AdminLogin from '../pages/Admin/AdminLogin';
import AdminDashboard from '../pages/Admin/Dashboard';
import AddChannel from '../pages/Admin/AddChannel';
import ManageNiches from '../pages/Admin/ManageNiches';
import ManageChannelTypes from '../pages/Admin/ManageChannelTypes';
import ManageFacelessIdeas from '../pages/Admin/ManageFacelessIdeas';
import ManageDidYouKnowFacts from '../pages/Admin/ManageDidYouKnowFacts';
import LinkCheckerPage from '../pages/Admin/components/tools/LinkCheckerPage';

export const adminRoutes = [
  {
    path: "/admin/login",
    element: <AdminLogin />
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <Navigate to="/admin/dashboard" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/channels/add",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AddChannel />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/channels/edit/:channelId",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AddChannel />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/niches",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <ManageNiches />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/channel-types",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <ManageChannelTypes />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/faceless-ideas",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <ManageFacelessIdeas />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/did-you-know-facts",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <ManageDidYouKnowFacts />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/tools/link-checker",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <LinkCheckerPage />
      </ProtectedRoute>
    ),
  },
];

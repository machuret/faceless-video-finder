
import React from 'react';
import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { lazyLoad } from './loaders';

// Import components directly instead of lazy loading to fix import errors
import AdminLogin from '../pages/Admin/AdminLogin';
import AdminDashboard from '../pages/Admin/Dashboard';
import ManageNiches from '../pages/Admin/components/niches/ManageNiches';

// Continue lazy loading other admin components
const AddChannel = React.lazy(() => import('../pages/Admin/AddChannel'));
const ManageChannelTypes = React.lazy(() => import('../pages/Admin/ManageChannelTypes'));
const ManageFacelessIdeas = React.lazy(() => import('../pages/Admin/ManageFacelessIdeas'));
const ManageDidYouKnowFacts = React.lazy(() => import('../pages/Admin/ManageDidYouKnowFacts'));
const LinkCheckerPage = React.lazy(() => import('../pages/Admin/components/tools/LinkCheckerPage'));
const ManageUsers = React.lazy(() => import('../pages/Admin/ManageUsers'));

export const adminRoutes = [
  // Root admin path should redirect to dashboard
  {
    path: "/admin",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <Navigate to="/admin/dashboard" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/login",
    element: <AdminLogin />
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
        {lazyLoad(AddChannel)}
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/channels/edit/:channelId",
    element: (
      <ProtectedRoute requireAdmin={true}>
        {lazyLoad(AddChannel)}
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
        {lazyLoad(ManageChannelTypes)}
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/faceless-ideas",
    element: (
      <ProtectedRoute requireAdmin={true}>
        {lazyLoad(ManageFacelessIdeas)}
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/did-you-know-facts",
    element: (
      <ProtectedRoute requireAdmin={true}>
        {lazyLoad(ManageDidYouKnowFacts)}
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/tools/link-checker",
    element: (
      <ProtectedRoute requireAdmin={true}>
        {lazyLoad(LinkCheckerPage)}
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute requireAdmin={true}>
        {lazyLoad(ManageUsers)}
      </ProtectedRoute>
    ),
  },
  // Catch-all route for admin to redirect to dashboard
  {
    path: "/admin/*",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <Navigate to="/admin/dashboard" replace />
      </ProtectedRoute>
    ),
  }
];

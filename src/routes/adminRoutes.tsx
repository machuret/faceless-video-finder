
import React from 'react';
import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { lazy } from 'react';
import { lazyLoad } from './loaders';

// Lazy load admin components
const AdminLogin = lazy(() => import('../pages/Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('../pages/Admin/Dashboard'));
const AddChannel = lazy(() => import('../pages/Admin/AddChannel'));
const ManageNiches = lazy(() => import('../pages/Admin/ManageNiches'));
const ManageChannelTypes = lazy(() => import('../pages/Admin/ManageChannelTypes'));
const ManageFacelessIdeas = lazy(() => import('../pages/Admin/ManageFacelessIdeas'));
const ManageDidYouKnowFacts = lazy(() => import('../pages/Admin/ManageDidYouKnowFacts'));
const LinkCheckerPage = lazy(() => import('../pages/Admin/components/tools/LinkCheckerPage'));

export const adminRoutes = [
  {
    path: "/admin/login",
    element: lazyLoad(AdminLogin)
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
        {lazyLoad(AdminDashboard)}
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
        {lazyLoad(ManageNiches)}
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
];

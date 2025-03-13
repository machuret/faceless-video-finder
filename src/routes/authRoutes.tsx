
import React from 'react';
import { lazy } from 'react';
import { lazyLoad } from './loaders';
import { UserProtectedRoute } from '../components/UserProtectedRoute';

// Lazy load auth components
const Register = lazy(() => import('../pages/Auth/Register'));
const Login = lazy(() => import('../pages/Auth/Login'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
const UpdatePassword = lazy(() => import('../pages/Auth/UpdatePassword'));
const Profile = lazy(() => import('../pages/Auth/Profile'));

export const authRoutes = [
  {
    path: "/auth/register",
    element: lazyLoad(Register)
  },
  {
    path: "/auth/login",
    element: lazyLoad(Login)
  },
  {
    path: "/auth/forgot-password",
    element: lazyLoad(ForgotPassword)
  },
  {
    path: "/auth/update-password",
    element: lazyLoad(UpdatePassword)
  },
  {
    path: "/profile",
    element: (
      <UserProtectedRoute>
        {lazyLoad(Profile)}
      </UserProtectedRoute>
    ),
  },
];

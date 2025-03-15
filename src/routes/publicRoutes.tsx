
import { lazy } from 'react';
import { lazyLoad } from './loaders';
import Auth from "../pages/Auth";
import Profile from "../pages/Profile";

// Lazy load page components
const Home = lazy(() => import('../pages/Index'));
const Contact = lazy(() => import('../pages/ContactUs'));
const Calculators = lazy(() => import('../pages/Calculators'));
const FacelessIdeas = lazy(() => import('../pages/FacelessIdeas'));
const Niches = lazy(() => import('../pages/Niches'));
const PrivacyPolicy = lazy(() => import('../pages/NotFound')); // Temporary placeholder
const TermsOfService = lazy(() => import('../pages/NotFound')); // Temporary placeholder

export const publicRoutes = [
  {
    path: "/",
    element: lazyLoad(Home),
  },
  {
    path: "/contact",
    element: lazyLoad(Contact),
  },
  {
    path: "/calculators",
    element: lazyLoad(Calculators),
  },
  {
    path: "/faceless-ideas",
    element: lazyLoad(FacelessIdeas),
  },
  {
    path: "/niches",
    element: lazyLoad(Niches),
  },
  {
    path: "/privacy-policy",
    element: lazyLoad(PrivacyPolicy),
  },
  {
    path: "/terms-of-service",
    element: lazyLoad(TermsOfService),
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
];

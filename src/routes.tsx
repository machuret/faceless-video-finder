
import React, { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Load common components eagerly (these are used frequently)
import NotFound from './pages/NotFound';
import MainLoader from './components/MainLoader';

// Create a proper loading component
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
    <p className="text-sm text-muted-foreground">Loading page...</p>
  </div>
);

// Lazy load all page components
const Index = lazy(() => import('./pages/Index'));
const ChannelSearch = lazy(() => import('./pages/ChannelSearch'));
const ChannelDetails = lazy(() => import('./pages/ChannelDetails'));
const Calculators = lazy(() => import('./pages/Calculators'));
const Calculator = lazy(() => import('./pages/Calculator'));
const GrowthRateCalculator = lazy(() => import('./pages/GrowthRateCalculator'));
const ReachCalculator = lazy(() => import('./pages/ReachCalculator'));
const ChannelEarnings = lazy(() => import('./pages/ChannelEarnings'));
const Training = lazy(() => import('./pages/Training'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const ChannelTypes = lazy(() => import('./pages/ChannelTypes'));
const ChannelTypeDetails = lazy(() => import('./pages/ChannelTypeDetails'));
const Niches = lazy(() => import('./pages/Niches'));
const NicheDetails = lazy(() => import('./pages/NicheDetails'));
const FacelessIdeas = lazy(() => import('./pages/FacelessIdeas'));
const FacelessIdeaDetails = lazy(() => import('./pages/FacelessIdeaDetails'));
const FacelessChannelIdeas = lazy(() => import('./pages/FacelessChannelIdeas'));

// Lazy load admin pages separately (most users don't need these)
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const AddChannel = lazy(() => import('./pages/Admin/AddChannel'));
const ManageNiches = lazy(() => import('./pages/Admin/ManageNiches'));
const ManageChannelTypes = lazy(() => import('./pages/Admin/ManageChannelTypes'));
const ManageFacelessIdeas = lazy(() => import('./pages/Admin/ManageFacelessIdeas'));
const ManageDidYouKnowFacts = lazy(() => import('./pages/Admin/ManageDidYouKnowFacts'));

// Wrap with suspense for better loading experience
const routes = [
  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Index />
      </Suspense>
    ),
  },
  {
    path: "/channels",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ChannelSearch />
      </Suspense>
    ),
  },
  {
    path: "/channel/:slug",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ChannelDetails />
      </Suspense>
    ),
  },
  {
    path: "/calculators",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Calculators />
      </Suspense>
    ),
  },
  {
    path: "/calculator",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Calculator />
      </Suspense>
    ),
  },
  {
    path: "/growth-rate-calculator",
    element: (
      <Suspense fallback={<PageLoader />}>
        <GrowthRateCalculator />
      </Suspense>
    ),
  },
  {
    path: "/reach-calculator",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ReachCalculator />
      </Suspense>
    ),
  },
  {
    path: "/channel-earnings",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ChannelEarnings />
      </Suspense>
    ),
  },
  {
    path: "/training",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Training />
      </Suspense>
    ),
  },
  {
    path: "/about",
    element: (
      <Suspense fallback={<PageLoader />}>
        <AboutUs />
      </Suspense>
    ),
  },
  {
    path: "/contact",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ContactUs />
      </Suspense>
    ),
  },
  {
    path: "/how-it-works",
    element: (
      <Suspense fallback={<PageLoader />}>
        <HowItWorks />
      </Suspense>
    ),
  },
  {
    path: "/channel-types",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ChannelTypes />
      </Suspense>
    ),
  },
  {
    path: "/channel-type/:id",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ChannelTypeDetails />
      </Suspense>
    ),
  },
  {
    path: "/niches",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Niches />
      </Suspense>
    ),
  },
  {
    path: "/niche/:id",
    element: (
      <Suspense fallback={<PageLoader />}>
        <NicheDetails />
      </Suspense>
    ),
  },
  {
    path: "/faceless-ideas",
    element: (
      <Suspense fallback={<PageLoader />}>
        <FacelessIdeas />
      </Suspense>
    ),
  },
  {
    path: "/faceless-idea/:id",
    element: (
      <Suspense fallback={<PageLoader />}>
        <FacelessIdeaDetails />
      </Suspense>
    ),
  },
  {
    path: "/faceless-channel-ideas",
    element: (
      <Suspense fallback={<PageLoader />}>
        <FacelessChannelIdeas />
      </Suspense>
    ),
  },
  // Admin routes with protected route wrappers
  {
    path: "/admin/login",
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminLogin />
      </Suspense>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <Suspense fallback={<PageLoader />}>
          <AdminDashboard />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/dashboard",
    element: <Navigate to="/admin" replace />,
  },
  {
    path: "/admin/add-channel",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <Suspense fallback={<PageLoader />}>
          <AddChannel />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/manage-niches",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <Suspense fallback={<PageLoader />}>
          <ManageNiches />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/manage-channel-types",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <Suspense fallback={<PageLoader />}>
          <ManageChannelTypes />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/manage-faceless-ideas",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <Suspense fallback={<PageLoader />}>
          <ManageFacelessIdeas />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/manage-did-you-know-facts",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <Suspense fallback={<PageLoader />}>
          <ManageDidYouKnowFacts />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  // 404 route
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;

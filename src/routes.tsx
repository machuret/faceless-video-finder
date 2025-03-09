
import { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import Index from '@/pages/Index';
import ChannelSearch from '@/pages/ChannelSearch';
import ChannelDetails from '@/pages/ChannelDetails';
import NotFound from '@/pages/NotFound';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import AboutUs from '@/pages/AboutUs';
import HowItWorks from '@/pages/HowItWorks';
import ContactUs from '@/pages/ContactUs';
import Calculators from '@/pages/Calculators';
import GrowthRateCalculator from '@/pages/GrowthRateCalculator';
import ReachCalculator from '@/pages/ReachCalculator';
import ChannelEarnings from '@/pages/ChannelEarnings';
import FacelessIdeas from '@/pages/FacelessIdeas';
import FacelessChannelIdeas from '@/pages/FacelessChannelIdeas';
import FacelessIdeaDetails from '@/pages/FacelessIdeaDetails';
import Training from '@/pages/Training';
import ChannelTypes from '@/pages/ChannelTypes';
import ChannelTypeDetails from '@/pages/ChannelTypeDetails';

// Admin routes
import AdminLogin from '@/pages/Admin/AdminLogin';
import Dashboard from '@/pages/Admin/Dashboard';
import AddChannel from '@/pages/Admin/AddChannel';
import ManageNichesPage from '@/pages/Admin/ManageNichesPage';
import ManageChannelTypes from '@/pages/Admin/ManageChannelTypes';
import ManageFacelessIdeas from '@/pages/Admin/ManageFacelessIdeas';
import ManageDidYouKnowFacts from '@/pages/Admin/ManageDidYouKnowFacts';
import Calculator from '@/pages/Calculator';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/channels',
    element: <ChannelSearch />,
  },
  {
    path: '/channel/:slug',
    element: <ChannelDetails />,
  },
  {
    path: '/about',
    element: <AboutUs />,
  },
  {
    path: '/how-it-works',
    element: <HowItWorks />,
  },
  {
    path: '/contact',
    element: <ContactUs />,
  },
  {
    path: '/calculators',
    element: <Calculators />,
  },
  {
    path: '/calculator',
    element: <Calculator />,
  },
  {
    path: '/calculators/growth-rate',
    element: <GrowthRateCalculator />,
  },
  {
    path: '/calculators/reach',
    element: <ReachCalculator />,
  },
  {
    path: '/calculators/earnings',
    element: <ChannelEarnings />,
  },
  {
    path: '/faceless-ideas',
    element: <FacelessIdeas />,
  },
  {
    path: '/faceless-channel-ideas',
    element: <FacelessChannelIdeas />,
  },
  {
    path: '/faceless-idea/:id',
    element: <FacelessIdeaDetails />,
  },
  {
    path: '/training',
    element: <Training />,
  },
  {
    path: '/channel-types',
    element: <ChannelTypes />,
  },
  {
    path: '/channel-type/:slug',
    element: <ChannelTypeDetails />,
  },
  // Admin routes
  {
    path: '/admin',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: '/admin/',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute requireAdmin>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/add-channel',
    element: (
      <ProtectedRoute requireAdmin>
        <AddChannel />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/manage-niches',
    element: (
      <ProtectedRoute requireAdmin>
        <ManageNichesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/manage-channel-types',
    element: (
      <ProtectedRoute requireAdmin>
        <ManageChannelTypes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/manage-faceless-ideas',
    element: (
      <ProtectedRoute requireAdmin>
        <ManageFacelessIdeas />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/manage-did-you-know-facts',
    element: (
      <ProtectedRoute requireAdmin>
        <ManageDidYouKnowFacts />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;

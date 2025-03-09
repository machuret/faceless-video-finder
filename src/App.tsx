
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";

// Pages
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import AboutUs from "@/pages/AboutUs";
import ContactUs from "@/pages/ContactUs";
import HowItWorks from "@/pages/HowItWorks";
import Training from "@/pages/Training";
import Calculator from "@/pages/Calculator";
import Calculators from "@/pages/Calculators";
import ChannelEarnings from "@/pages/ChannelEarnings";
import ReachCalculator from "@/pages/ReachCalculator";
import GrowthRateCalculator from "@/pages/GrowthRateCalculator";
import ChannelDetails from "@/pages/ChannelDetails";
import FacelessIdeas from "@/pages/FacelessIdeas";
import FacelessChannelIdeas from "@/pages/FacelessChannelIdeas";
import FacelessIdeaDetails from "@/pages/FacelessIdeaDetails";
import ChannelTypes from "@/pages/ChannelTypes";
import ChannelTypeDetails from "@/pages/ChannelTypeDetails";
import ManageNichesPage from "@/pages/Admin/ManageNichesPage";

// Admin Pages
import AdminLogin from "@/pages/Admin/AdminLogin";
import Dashboard from "@/pages/Admin/Dashboard";
import AddChannel from "@/pages/Admin/AddChannel";
import ManageChannelTypes from "@/pages/Admin/ManageChannelTypes";
import ManageFacelessIdeas from "@/pages/Admin/ManageFacelessIdeas";
import ManageDidYouKnowFacts from "@/pages/Admin/ManageDidYouKnowFacts";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import "./App.css";

const App = () => {
  return (
    <QueryProvider>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/training" element={<Training />} />
              <Route path="/calculators" element={<Calculators />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/channel-earnings" element={<ChannelEarnings />} />
              <Route path="/reach-calculator" element={<ReachCalculator />} />
              <Route path="/growth-calculator" element={<GrowthRateCalculator />} />
              
              {/* Legacy channel route - keep for backward compatibility */}
              <Route path="/channels/:channelId" element={<ChannelDetails />} />
              
              {/* SEO-friendly channel route */}
              <Route path="/channel/:slug" element={<ChannelDetails />} />
              
              <Route path="/faceless-ideas" element={<FacelessIdeas />} />
              <Route path="/faceless-channels" element={<FacelessChannelIdeas />} />
              <Route path="/faceless-channel-ideas" element={<FacelessChannelIdeas />} />
              <Route path="/faceless-ideas/:ideaId" element={<FacelessIdeaDetails />} />
              <Route path="/channel-types" element={<ChannelTypes />} />
              <Route path="/channel-types/:typeId" element={<ChannelTypeDetails />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route
                path="/admin/dashboard"
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
              />
              <Route
                path="/admin/channels/add"
                element={<ProtectedRoute><AddChannel /></ProtectedRoute>}
              />
              <Route
                path="/admin/channels/edit/:channelId"
                element={<ProtectedRoute><AddChannel /></ProtectedRoute>}
              />
              <Route
                path="/admin/channel-types"
                element={<ProtectedRoute><ManageChannelTypes /></ProtectedRoute>}
              />
              <Route
                path="/admin/did-you-know"
                element={<ProtectedRoute><ManageDidYouKnowFacts /></ProtectedRoute>}
              />
              <Route
                path="/admin/faceless-ideas"
                element={<ProtectedRoute><ManageFacelessIdeas /></ProtectedRoute>}
              />
              <Route
                path="/admin/niches"
                element={<ProtectedRoute><ManageNichesPage /></ProtectedRoute>}
              />
              
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryProvider>
  );
};

export default App;

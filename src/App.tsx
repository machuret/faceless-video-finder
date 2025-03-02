
import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Index from './pages/Index'
import Calculator from './pages/Calculator'
import ChannelEarnings from './pages/ChannelEarnings'
import ReachCalculator from './pages/ReachCalculator'
import GrowthRateCalculator from './pages/GrowthRateCalculator'
import Calculators from './pages/Calculators'
import AboutUs from './pages/AboutUs'
import HowItWorks from './pages/HowItWorks'
import ContactUs from './pages/ContactUs'
import ChannelDetails from './pages/ChannelDetails'
import AdminLogin from './pages/Admin/AdminLogin'
import Dashboard from './pages/Admin/Dashboard'
import ManageChannelTypes from './pages/Admin/ManageChannelTypes'
import ManageFacelessIdeas from './pages/Admin/ManageFacelessIdeas'
import AddChannel from './pages/Admin/AddChannel'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from './context/AuthContext'
import ChannelTypes from './pages/ChannelTypes'
import ChannelTypeDetails from './pages/ChannelTypeDetails'
import FacelessIdeas from './pages/FacelessIdeas'
import FacelessIdeaDetails from './pages/FacelessIdeaDetails'
import NotFound from './pages/NotFound'
import TrainingPage from './pages/Training'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/home" element={<Index />} />
        <Route path="/" element={<Index />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/channel-earnings" element={<ChannelEarnings />} />
        <Route path="/reach-calculator" element={<ReachCalculator />} />
        <Route path="/growth-calculator" element={<GrowthRateCalculator />} />
        <Route path="/calculators" element={<Calculators />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/channel/:channelId" element={<ChannelDetails />} />
        <Route path="/channel-types" element={<ChannelTypes />} />
        <Route path="/channel-types/:typeId" element={<ChannelTypeDetails />} />
        <Route path="/faceless-ideas" element={<FacelessIdeas />} />
        <Route path="/faceless-ideas/:ideaId" element={<FacelessIdeaDetails />} />
        <Route path="/training" element={<TrainingPage />} />
        
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/channel-types" element={<ManageChannelTypes />} />
        <Route path="/admin/faceless-ideas" element={<ManageFacelessIdeas />} />
        <Route path="/admin/add-channel" element={<AddChannel />} />
        <Route path="/admin/edit-channel/:channelId" element={<AddChannel />} />
        
        {/* 404 catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;

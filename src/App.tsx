
import React from 'react'
import { Route, Routes } from 'react-router-dom'
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
import AddChannel from './pages/Admin/AddChannel'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from './context/AuthContext'
import ChannelTypes from './pages/ChannelTypes'
import NotFound from './pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <Routes>
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
        <Route path="/training" element={<HowItWorks />} /> {/* Temporarily point to HowItWorks until Training page is created */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/channel-types" element={<ManageChannelTypes />} />
        <Route path="/admin/add-channel" element={<AddChannel />} />
        <Route path="/admin/edit-channel/:channelId" element={<AddChannel />} />
        <Route path="*" element={<NotFound />} /> {/* Add a catch-all route for 404 handling */}
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;

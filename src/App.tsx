
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Index from './pages/Index'
import Calculator from './pages/Calculator'
import ChannelEarnings from './pages/ChannelEarnings'
import ReachCalculator from './pages/ReachCalculator'
import GrowthRateCalculator from './pages/GrowthRateCalculator'
import Calculators from './pages/Calculators'
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <>
      <Routes>
        <Route path="/home" element={<Index />} />
        <Route path="/" element={<Index />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/channel-earnings" element={<ChannelEarnings />} />
        <Route path="/reach-calculator" element={<ReachCalculator />} />
        <Route path="/growth-calculator" element={<GrowthRateCalculator />} />
        <Route path="/calculators" element={<Calculators />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;

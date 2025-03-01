
import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Index from './pages/Index'
import Calculator from './pages/Calculator'
import ChannelEarnings from './pages/ChannelEarnings'
import ReachCalculator from './pages/ReachCalculator'
import GrowthRateCalculator from './pages/GrowthRateCalculator'
import { ThemeProvider } from 'next-themes'
import { Toaster } from "@/components/ui/toaster"
import { QueryProvider } from './providers/QueryProvider'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/home" element={<Index />} />
            <Route path="/" element={<Index />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/channel-earnings" element={<ChannelEarnings />} />
            <Route path="/reach-calculator" element={<ReachCalculator />} />
            <Route path="/growth-calculator" element={<GrowthRateCalculator />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;

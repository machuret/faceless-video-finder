import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Index from './pages/Index'
import Calculator from './pages/Calculator'
import ChannelEarnings from './pages/ChannelEarnings'
import ReachCalculator from './pages/ReachCalculator'
import { ThemeProvider } from './components/ThemeProvider'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from 'react-auth-kit'
import { QueryProvider } from './components/QueryProvider'

function App() {
  const getCookie = (name: string) => document.cookie.split('; ').find(row => row.startsWith(`${name}=`))?.split('=')[1];
  const initialAuthState = getCookie('_auth') ? true : false;
  const initialAuthToken = getCookie('_auth_token') || null;
  const initialAuthTokenType = getCookie('_auth_token_type') || 'Bearer';
  const initialAuthExpiresAt = getCookie('_auth_expires_at') || null;

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryProvider>
        <BrowserRouter>
          <AuthProvider
            authType={'cookie'}
            authName='_auth'
            cookieDomain={window.location.hostname}
            cookieSecure={window.location.protocol === "https:"}
          >
            <Routes>
              <Route path="/home" element={<Index />} />
              <Route path="/" element={<Index />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/channel-earnings" element={<ChannelEarnings />} />
              <Route path="/reach-calculator" element={<ReachCalculator />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;

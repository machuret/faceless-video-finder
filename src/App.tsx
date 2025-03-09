
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import routes from './routes';
import { initializeStorage } from './integrations/supabase/initStorage';

function App() {
  useEffect(() => {
    // Initialize storage buckets on app startup
    initializeStorage()
      .then(result => {
        if (result.success) {
          console.log("Storage buckets initialized successfully");
        }
      })
      .catch(error => {
        console.error("Failed to initialize storage buckets:", error);
      });
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Routes>
        {Array.isArray(routes) ? routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        )) : null}
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;

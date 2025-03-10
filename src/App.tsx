
import React, { useEffect, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import routes from './routes';
import { initializeStorage } from './integrations/supabase/initStorage';
import { AuthProvider } from './context/AuthContext';
import MainLoader from './components/MainLoader';

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

  const router = createBrowserRouter(routes);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Suspense fallback={<MainLoader />}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;

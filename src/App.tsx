
import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import routes from './routes';
import { initializeStorage } from './integrations/supabase/initStorage';
import { AuthProvider } from './context/AuthContext';
import MainLoader from './components/MainLoader';

function App() {
  React.useEffect(() => {
    // Initialize storage buckets on app startup with better error handling
    try {
      initializeStorage()
        .then(result => {
          if (result.success) {
            console.log("Storage buckets initialized successfully");
          } else {
            console.warn("Storage initialization warning:", result.error);
            // Continue even if storage init fails
          }
        })
        .catch(error => {
          console.error("Failed to initialize storage buckets:", error);
          // Continue even if storage init fails
        });
    } catch (e) {
      console.error("Critical error in storage initialization:", e);
      // Continue despite errors
    }
  }, []);

  const router = createBrowserRouter(routes);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <RouterProvider router={router} fallbackElement={<MainLoader />} />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

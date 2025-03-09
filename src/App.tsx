
import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import routes from './routes';
import { initializeStorage } from './integrations/supabase/initStorage';
import { useAuth } from './context/AuthContext';

function App() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

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

  if (!Array.isArray(routes)) {
    console.error("Routes is not an array:", routes);
    return <div>Error loading routes</div>;
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;

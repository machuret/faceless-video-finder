
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import routes from './routes';
import { initializeStorage } from './integrations/supabase/initStorage';

function App() {
  React.useEffect(() => {
    // Initialize storage buckets on app startup
    initializeStorage()
      .then(result => {
        if (result.success) {
          console.log("Storage buckets initialized successfully");
        } else if (result.warning) {
          console.warn("Storage initialization warning:", result.warning);
        } else if (result.error) {
          console.error("Failed to initialize storage buckets:", result.error);
        }
      })
      .catch(error => {
        console.error("Unexpected error initializing storage buckets:", error);
      });
  }, []);

  if (!Array.isArray(routes)) {
    console.error("Routes is not an array:", routes);
    return <div>Error loading routes</div>;
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Routes>
        {routes.map((route, index) => (
          <Route key={`${route.path}-${index}`} path={route.path} element={route.element} />
        ))}
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;


import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) => {
  const { user, isAdmin, loading } = useAuth();
  const [showLoader, setShowLoader] = useState(loading);
  const [loadingTimer, setLoadingTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timer when loading state changes
    if (loadingTimer) {
      clearTimeout(loadingTimer);
    }

    // Only set timer if loading is true and showLoader is false
    if (loading && !showLoader) {
      const timer = setTimeout(() => setShowLoader(true), 300);
      setLoadingTimer(timer);
    }

    // Reset showLoader when loading is complete
    if (!loading) {
      setShowLoader(false);
    }

    // Cleanup
    return () => {
      if (loadingTimer) {
        clearTimeout(loadingTimer);
      }
    };
  }, [loading, showLoader, loadingTimer]);
  
  // Show loading spinner only if actually waiting for auth
  if (loading && showLoader) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Checking authorization...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

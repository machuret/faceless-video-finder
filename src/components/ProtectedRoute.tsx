
import { Navigate, useLocation } from "react-router-dom";
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
  const [showLoader, setShowLoader] = useState(false);
  const location = useLocation();

  // Show loader after a very short delay to prevent flash
  useEffect(() => {
    const timer = loading ? setTimeout(() => setShowLoader(true), 200) : null;
    if (!loading) setShowLoader(false);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading]);

  // Log current auth state for debugging
  useEffect(() => {
    console.log("ProtectedRoute - Auth state:", { 
      user: !!user, 
      isAdmin, 
      loading, 
      path: location.pathname 
    });
  }, [user, isAdmin, loading, location.pathname]);

  // If we're still loading but the timeout hasn't elapsed, render nothing
  if (loading && !showLoader) {
    return null;
  }
  
  // Show loader if we're loading and the timeout has passed
  if (loading && showLoader) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Verifying your access...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }
  
  // If admin access is required but user is not an admin
  if (requireAdmin && !isAdmin) {
    console.log("User is not admin, redirecting to home");
    return <Navigate to="/" replace />;
  }
  
  // User is authenticated and authorized
  console.log("User is authenticated and authorized, rendering protected content");
  return <>{children}</>;
};

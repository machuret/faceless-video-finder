
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
  
  // Store last valid auth state to prevent flickering
  const [hasVerifiedOnce, setHasVerifiedOnce] = useState(false);

  // Show loader after a delay to prevent flash
  useEffect(() => {
    if (!loading) {
      setShowLoader(false);
      if (user) {
        setHasVerifiedOnce(true);
      }
      return;
    }

    // Only show loader if we haven't verified the user yet
    // or if it's taking longer than expected
    const timer = setTimeout(() => {
      if (loading && !hasVerifiedOnce) {
        setShowLoader(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [loading, hasVerifiedOnce, user]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timeoutTimer = setTimeout(() => {
        if (loading) {
          console.warn("Auth verification taking too long, proceeding with current state");
          setShowLoader(false);
        }
      }, 3000); // 3 seconds max loading time
      
      return () => clearTimeout(timeoutTimer);
    }
  }, [loading]);

  // Debug logging
  useEffect(() => {
    console.log("ProtectedRoute state:", {
      loading,
      showLoader,
      hasVerifiedOnce,
      user: !!user,
      isAdmin,
      path: location.pathname
    });
  }, [loading, showLoader, hasVerifiedOnce, user, isAdmin, location.pathname]);

  // If we've already verified the user once and they're present, 
  // allow rendering the children while re-checking
  if (hasVerifiedOnce && user && (requireAdmin ? isAdmin : true)) {
    return <>{children}</>;
  }

  // Initial load and not verified yet - show minimal or no UI
  if (loading && !showLoader) {
    return null;
  }

  // Loading taking a while, show spinner
  if ((loading && showLoader) || (showLoader && !hasVerifiedOnce)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Verifying your access...</p>
      </div>
    );
  }

  // No user, redirect to login
  if (!user) {
    console.log("No user, redirecting to login");
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  // User found but not admin and admin required
  if (requireAdmin && !isAdmin) {
    console.log("User is not admin, redirecting to home");
    return <Navigate to="/" replace />;
  }

  // Access verified
  console.log("Access verified, rendering protected content");
  return <>{children}</>;
};

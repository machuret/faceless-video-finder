
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth/AuthContext";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export const UserProtectedRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, loading } = useAuth();
  const [showLoader, setShowLoader] = useState(false);
  const location = useLocation();
  
  // Show loader after a delay to prevent flash
  useEffect(() => {
    let loaderTimer: NodeJS.Timeout | null = null;

    if (loading) {
      loaderTimer = setTimeout(() => {
        setShowLoader(true);
      }, 500);
    } else {
      setShowLoader(false);
    }

    return () => {
      if (loaderTimer) clearTimeout(loaderTimer);
    };
  }, [loading]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    let timeoutTimer: NodeJS.Timeout | null = null;
    
    if (loading) {
      timeoutTimer = setTimeout(() => {
        if (loading) {
          console.warn("Auth verification taking too long, proceeding with current state");
          setShowLoader(false);
        }
      }, 3000); // 3 seconds max loading time
    }
    
    return () => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
    };
  }, [loading]);

  // Loading taking a while, show spinner
  if (loading && showLoader) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Verifying your access...</p>
      </div>
    );
  }

  // No user, redirect to login
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  // User authenticated, show the protected content
  return <>{children}</>;
};

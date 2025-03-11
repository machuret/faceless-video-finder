
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
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
  
  // Use a ref to track verification attempts and prevent infinite loops
  const verificationAttemptsRef = useRef(0);
  const maxVerificationAttempts = 3;

  // Show loader after a delay to prevent flash
  useEffect(() => {
    let loaderTimer: NodeJS.Timeout | null = null;

    if (loading) {
      loaderTimer = setTimeout(() => {
        setShowLoader(true);
      }, 500);
    } else {
      setShowLoader(false);
      if (user) {
        setHasVerifiedOnce(true);
      }
    }

    return () => {
      if (loaderTimer) clearTimeout(loaderTimer);
    };
  }, [loading, user]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    let timeoutTimer: NodeJS.Timeout | null = null;
    
    if (loading) {
      verificationAttemptsRef.current += 1;
      
      if (verificationAttemptsRef.current >= maxVerificationAttempts) {
        console.warn(`Auth verification attempts exceeded (${verificationAttemptsRef.current}/${maxVerificationAttempts}), breaking verification loop`);
        setShowLoader(false);
        return;
      }
      
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

  // Debug logging
  useEffect(() => {
    console.log("ProtectedRoute state:", {
      loading,
      showLoader,
      hasVerifiedOnce,
      user: user ? user.email : null,
      isAdmin,
      path: location.pathname,
      verificationAttempts: verificationAttemptsRef.current
    });
  }, [loading, showLoader, hasVerifiedOnce, user, isAdmin, location.pathname]);

  // If we've already verified the user once and they're present, 
  // allow rendering the children while re-checking
  if (hasVerifiedOnce && user && (requireAdmin ? isAdmin : true)) {
    return <>{children}</>;
  }

  // Verification attempts exceeded max or auth loading timeout reached, take best guess
  if (verificationAttemptsRef.current >= maxVerificationAttempts) {
    if (user && (requireAdmin ? isAdmin : true)) {
      return <>{children}</>;
    } else if (!user) {
      return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
    } else if (requireAdmin && !isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

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
    console.log("No user, redirecting to login");
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  // User found but not admin and admin required
  if (requireAdmin && !isAdmin) {
    console.log("User is not admin, redirecting to home");
    return <Navigate to="/" replace />;
  }

  // Access verified or loading timed out, render children
  return <>{children}</>;
};

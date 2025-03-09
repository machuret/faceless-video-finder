
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

  // Use useEffect to handle the delayed loader display
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (loading) {
      // Set a timeout to show the loader after a short delay
      timer = setTimeout(() => {
        setShowLoader(true);
      }, 300);
    } else {
      setShowLoader(false);
    }
    
    // Cleanup function
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [loading]);
  
  // Show loading spinner only if actually waiting for auth and showLoader is true
  if (loading && showLoader) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Checking authorization...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  // Redirect to home if user is not an admin but the route requires admin
  if (requireAdmin && !isAdmin) {
    console.log("User is not admin, redirecting to home");
    return <Navigate to="/" replace />;
  }
  
  // Return children if authenticated and authorized
  console.log("User is authenticated and authorized, rendering protected content");
  return <>{children}</>;
};

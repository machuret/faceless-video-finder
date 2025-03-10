
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
    let timer: NodeJS.Timeout | null = null;
    
    if (loading) {
      timer = setTimeout(() => {
        setShowLoader(true);
      }, 100); // Very short timeout for smoother UX
    } else {
      setShowLoader(false);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [loading]);

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
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  // If admin access is required but user is not an admin
  if (requireAdmin && !isAdmin) {
    console.log("User is not admin, redirecting to home");
    toast.error("You don't have admin access");
    return <Navigate to="/" replace />;
  }
  
  // User is authenticated and authorized
  console.log("User is authenticated and authorized, rendering protected content");
  return <>{children}</>;
};

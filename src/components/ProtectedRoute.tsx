
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) => {
  const { user, isAdmin, loading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  
  // Memoize the authentication check result
  const authResult = useMemo(() => {
    // Not ready to make a decision yet
    if (loading) return null;
    
    // If authentication is required and user is not logged in
    if (!user) {
      return <Navigate to="/admin/login" replace />;
    }
    
    // If admin is required and user is not admin
    if (requireAdmin && !isAdmin) {
      return <Navigate to="/" replace />;
    }
    
    // If everything is fine, render the children
    return children;
  }, [user, isAdmin, loading, requireAdmin, children]);
  
  // Use an effect to ensure the auth check is truly complete, but with optimized timing
  useEffect(() => {
    if (!loading && !authChecked) {
      // Small delay to ensure all auth states are properly updated
      // This helps prevent authentication loops
      const timer = setTimeout(() => {
        setAuthChecked(true);
      }, 100); // Reduced from 200ms to 100ms for faster rendering
      
      return () => clearTimeout(timer);
    }
  }, [loading, authChecked]);

  // Show loading spinner only during initial auth check
  if (loading || !authChecked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Authenticating...</p>
      </div>
    );
  }

  // Return the memoized result
  return authResult;
};

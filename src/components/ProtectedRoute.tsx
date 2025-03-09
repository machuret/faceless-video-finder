
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) => {
  const { user, isAdmin, loading } = useAuth();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  console.log("ProtectedRoute - Auth state:", { 
    userExists: !!user, 
    isAdmin, 
    loading,
    userEmail: user?.email,
    authCheckComplete
  });

  // Use an effect to ensure the auth check is truly complete
  useEffect(() => {
    if (!loading) {
      // Small delay to ensure all auth states are properly updated
      const timer = setTimeout(() => {
        setAuthCheckComplete(true);
      }, 300); // Reduced from 500ms to 300ms for faster rendering
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Show loading spinner while authentication is in progress
  if (loading || !authCheckComplete) {
    console.log("ProtectedRoute - Still loading auth state");
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Authenticating...</p>
      </div>
    );
  }

  // Redirect to login if not logged in
  if (!user) {
    console.log("ProtectedRoute - No user, redirecting to login");
    return <Navigate to="/admin/login" replace />;
  }

  // Redirect to home if not admin and admin is required
  if (requireAdmin && !isAdmin) {
    console.log("ProtectedRoute - User not admin, redirecting to home");
    return <Navigate to="/" replace />;
  }

  console.log("ProtectedRoute - Rendering protected content");
  return <>{children}</>;
};

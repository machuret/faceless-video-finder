
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

  // Use an effect to ensure the auth check is truly complete
  useEffect(() => {
    if (!loading) {
      // Small delay to ensure all auth states are properly updated
      // This helps prevent authentication loops
      const timer = setTimeout(() => {
        setAuthCheckComplete(true);
      }, 200); // Reduced from 300ms to 200ms for faster rendering
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Show loading spinner while authentication is in progress
  if (loading || !authCheckComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Authenticating...</p>
      </div>
    );
  }

  // Redirect to login if not logged in
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Redirect to home if not admin and admin is required
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

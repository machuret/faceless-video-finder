
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) => {
  const { user, isAdmin, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log("ProtectedRoute - Auth state:", { user, isAdmin, loading });
    
    const timeoutId = setTimeout(() => {
      if (!loading) {
        console.log("ProtectedRoute - Auth check complete");
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [user, isAdmin, loading]);

  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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

  return <>{children}</>;
};

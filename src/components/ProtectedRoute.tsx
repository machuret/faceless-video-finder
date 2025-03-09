
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

  console.log("ProtectedRoute - Auth state:", { 
    userExists: !!user, 
    isAdmin, 
    loading,
    userEmail: user?.email
  });

  // Show loading spinner while authentication is in progress
  if (loading) {
    console.log("ProtectedRoute - Still loading auth state");
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p>Authenticating...</p>
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

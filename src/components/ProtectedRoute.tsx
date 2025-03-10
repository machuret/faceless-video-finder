
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

  // Show loader after a delay to prevent flash
  useEffect(() => {
    if (!loading) {
      setShowLoader(false);
      return;
    }

    const timer = setTimeout(() => {
      if (loading) {
        setShowLoader(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [loading]);

  // Debug logging
  useEffect(() => {
    console.log("ProtectedRoute state:", {
      loading,
      showLoader,
      user: !!user,
      isAdmin,
      path: location.pathname
    });
  }, [loading, showLoader, user, isAdmin, location.pathname]);

  if (loading && !showLoader) {
    return null;
  }

  if (loading && showLoader) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Verifying your access...</p>
      </div>
    );
  }

  if (!user) {
    console.log("No user, redirecting to login");
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    console.log("User is not admin, redirecting to home");
    return <Navigate to="/" replace />;
  }

  console.log("Access verified, rendering protected content");
  return <>{children}</>;
};

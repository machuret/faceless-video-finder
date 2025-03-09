
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading || isChecking) {
        console.log("Auth check timeout reached, forcing completion");
        setTimeoutReached(true);
      }
    }, 2000); // 2 second timeout (reduced from 3s)

    return () => clearTimeout(timer);
  }, [loading, isChecking]);

  useEffect(() => {
    console.log("ProtectedRoute auth state:", { 
      user: user ? "exists" : "null", 
      userId: user?.id,
      isAdmin, 
      loading, 
      requireAdmin,
      timeoutReached
    });

    // Only proceed if auth loading is complete or timeout reached
    if (!loading || timeoutReached) {
      // If no user, redirect to login
      if (!user) {
        console.log("No user found, redirecting to login");
        navigate("/admin/login");
        setIsChecking(false);
        return;
      }
      
      // If admin is required but user is not admin
      if (requireAdmin && !isAdmin) {
        console.log("User is not admin, redirecting to login (requireAdmin: true, isAdmin: false)");
        navigate("/admin/login");
        setIsChecking(false);
        return;
      }
      
      // Auth check passed
      console.log("Auth check passed");
      setIsChecking(false);
    }
  }, [user, isAdmin, loading, navigate, requireAdmin, timeoutReached]);

  // Show loading state
  if ((loading || isChecking) && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Verifying authorization...</p>
          <p className="text-sm text-gray-500 mt-2">
            {loading ? "Loading authentication data..." : "Checking permissions..."}
          </p>
        </div>
      </div>
    );
  }

  // Don't render children unless auth check passed
  if (!user || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
};

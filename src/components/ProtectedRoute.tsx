
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
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [loading, isChecking]);

  useEffect(() => {
    // More detailed logging to debug the auth state
    console.log("ProtectedRoute auth state:", { 
      user: user ? "exists" : "null", 
      userId: user?.id,
      isAdmin, 
      loading, 
      requireAdmin,
      isChecking,
      timeoutReached
    });

    const checkAuth = () => {
      if (!user) {
        console.log("No user found, redirecting to login");
        navigate("/admin/login");
        return false;
      } 
      
      if (requireAdmin && !isAdmin) {
        console.log("User is not admin, redirecting to home");
        navigate("/");
        return false;
      }
      
      // Auth check passed
      console.log("Auth check passed");
      return true;
    };

    // If loading is done or timeout reached, check auth status
    if (!loading || timeoutReached) {
      const authPassed = checkAuth();
      setIsChecking(false);
      
      if (timeoutReached && !authPassed) {
        console.log("Timeout forced auth check completion");
      }
    }
  }, [user, isAdmin, loading, navigate, requireAdmin, timeoutReached]);

  // Show loading state
  if (loading && !timeoutReached) {
    console.log("ProtectedRoute: Still loading auth state");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Verifying authorization...</p>
          <p className="text-sm text-gray-500 mt-2">
            Loading authentication data...
          </p>
        </div>
      </div>
    );
  }

  // Show checking state with more info
  if (isChecking && !timeoutReached) {
    console.log("ProtectedRoute: Checking permissions");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Verifying authorization...</p>
          <p className="text-sm text-gray-500 mt-2">
            Checking permissions...
          </p>
        </div>
      </div>
    );
  }

  console.log("ProtectedRoute: Rendering children");
  return <>{children}</>;
};

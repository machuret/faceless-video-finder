
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Add a short timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading || isChecking) {
        console.log("Auth check timeout reached, forcing completion");
        setTimeoutReached(true);
      }
    }, 1000); // 1 second timeout

    return () => clearTimeout(timer);
  }, [loading, isChecking]);

  useEffect(() => {
    const authState = { 
      userId: user?.id,
      isAdmin, 
      loading, 
      requireAdmin,
      timeoutReached
    };
    
    console.log("ProtectedRoute checking auth:", authState);

    // Only proceed when auth loading is complete or timeout reached
    if (!loading || timeoutReached) {
      // No user = not authenticated
      if (!user) {
        console.log("No authenticated user, redirecting to login");
        toast.error("Please log in to access this page");
        navigate("/admin/login");
        setIsChecking(false);
        return;
      }
      
      // Admin check if required
      if (requireAdmin && !isAdmin) {
        console.log("Admin access required but user is not admin");
        toast.error("You don't have admin permissions");
        navigate("/admin/login");
        setIsChecking(false);
        return;
      }
      
      // Auth check passed
      console.log("Authorization check passed");
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

  // Only render children if fully authorized
  if (!user || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
};

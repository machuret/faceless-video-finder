
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

  useEffect(() => {
    // Add more specific logging to debug the loading state
    console.log("ProtectedRoute auth state:", { 
      user: user ? "exists" : "null", 
      isAdmin, 
      loading, 
      requireAdmin,
      isChecking
    });

    // Only proceed with checks when auth data is loaded
    if (!loading) {
      if (!user) {
        console.log("No user found, redirecting to login");
        navigate("/admin/login");
      } else if (requireAdmin && !isAdmin) {
        console.log("User is not admin, redirecting to home");
        navigate("/");
      } else {
        // Auth check passed, render the protected content
        console.log("Auth check passed, rendering content");
        setIsChecking(false);
      }
    }
  }, [user, isAdmin, loading, navigate, requireAdmin]);

  // Improve the loading state display with more information
  if (loading || isChecking) {
    console.log("ProtectedRoute: Still loading or checking auth state");
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

  console.log("ProtectedRoute: Rendering children");
  return <>{children}</>;
};

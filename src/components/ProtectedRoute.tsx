
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
    console.log("ProtectedRoute: ", { 
      user: !!user, 
      isAdmin, 
      loading, 
      requireAdmin,
      isChecking
    });

    // Only check authentication status when loading is complete
    if (!loading) {
      if (!user) {
        console.log("No user found, redirecting to login");
        navigate("/admin/login");
      } else if (requireAdmin && !isAdmin) {
        console.log("User is not admin, redirecting to home");
        navigate("/");
      } else {
        // Authentication check is complete, render the protected content
        console.log("Authentication check passed, rendering protected content");
        setIsChecking(false);
      }
    }
  }, [user, isAdmin, loading, navigate, requireAdmin]);

  if (loading || isChecking) {
    console.log("ProtectedRoute: Still loading or checking");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log("ProtectedRoute: Rendering children");
  return <>{children}</>;
};

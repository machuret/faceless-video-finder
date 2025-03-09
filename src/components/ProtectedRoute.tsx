
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

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
    console.log("ProtectedRoute - Auth state:", { user, isAdmin, loading });
    
    const timeoutId = setTimeout(() => {
      if (!loading) {
        console.log("ProtectedRoute - Auth check complete");
        if (!user) {
          console.log("ProtectedRoute - No user, redirecting to login");
          navigate("/admin/login");
        } else if (requireAdmin && !isAdmin) {
          console.log("ProtectedRoute - User not admin, redirecting to home");
          navigate("/");
        }
        setIsChecking(false);
      }
    }, 800); // Reduced timeout for faster response

    return () => clearTimeout(timeoutId);
  }, [user, isAdmin, loading, navigate, requireAdmin]);

  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};

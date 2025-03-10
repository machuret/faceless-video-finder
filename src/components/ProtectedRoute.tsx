import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
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
  const [showLoader, setShowLoader] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (loading) {
      timer = setTimeout(() => {
        setShowLoader(true);
      }, 300);
    } else {
      setShowLoader(false);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [loading]);
  
  if (loading && showLoader) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Checking authorization...</p>
      </div>
    );
  }

  if (!user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  if (requireAdmin && !isAdmin) {
    console.log("User is not admin, redirecting to home");
    return <Navigate to="/" replace />;
  }
  
  console.log("User is authenticated and authorized, rendering protected content");
  return <>{children}</>;
};

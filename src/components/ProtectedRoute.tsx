
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) => {
  const { user, isAdmin, loading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  
  // Memoize the authentication check result for performance
  const authResult = useMemo(() => {
    if (loading) return null;
    
    if (!user) {
      return <Navigate to="/admin/login" replace />;
    }
    
    if (requireAdmin && !isAdmin) {
      return <Navigate to="/" replace />;
    }
    
    return children;
  }, [user, isAdmin, loading, requireAdmin, children]);
  
  // Only use the timer once - reduced to 50ms for faster rendering
  useEffect(() => {
    if (!loading && !authChecked) {
      const timer = setTimeout(() => {
        setAuthChecked(true);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [loading, authChecked]);

  // Only show loading spinner during initial auth check
  if (loading || !authChecked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Checking authorization...</p>
      </div>
    );
  }

  return authResult;
};

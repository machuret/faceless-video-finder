
import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { AuthContextType } from "./auth/types";
import { useAdminCheck } from "./auth/useAdminCheck";
import { useAuthSignOut } from "./auth/useAuthSignOut";
import { useAuthInit } from "./auth/useAuthInit";

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // Create a client-side cache for admin status
  const adminCache = useMemo(() => new Map<string, boolean>(), []);
  
  const checkAdminStatus = useAdminCheck(setIsAdmin, setLoading);
  const signOut = useAuthSignOut(setUser, setIsAdmin, setLoading, adminCache);
  
  useAuthInit(
    initialized,
    setUser,
    setLoading,
    setInitialized,
    checkAdminStatus
  );

  // Add a timeout to prevent infinite loading state
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        if (loading) {
          console.log("Auth loading timeout reached, forcing loading state to false");
          setLoading(false);
        }
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    isAdmin,
    loading,
    signOut
  }), [user, isAdmin, loading, signOut]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

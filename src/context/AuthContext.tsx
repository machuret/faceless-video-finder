
import { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { AuthContextType } from "./auth/types";
import { useAdminCheck } from "./auth/useAdminCheck";
import { useAuthSignOut } from "./auth/useAuthSignOut";
import { useAuthInit } from "./auth/useAuthInit";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Use a ref for the admin cache to ensure it persists across renders
  const adminCacheRef = useRef(new Map<string, boolean>());
  
  const checkAdminStatus = useAdminCheck(setIsAdmin, setLoading);
  const signOut = useAuthSignOut(setUser, setIsAdmin, setLoading, adminCacheRef.current);
  
  useAuthInit(
    initialized,
    setUser,
    setLoading,
    setInitialized,
    checkAdminStatus
  );

  // Add a timeout to prevent infinite loading state
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (loading && user) {
      console.log("Setting loading timeout for user:", user.email);
      timer = setTimeout(() => {
        if (loading) {
          console.log("Auth loading timeout reached, forcing loading state to false");
          setLoading(false);
          
          // If we have a user but admin status check timed out, check again directly
          if (user) {
            // Convert the PromiseLike to a proper Promise to safely use catch
            Promise.resolve(
              supabase.rpc('check_is_admin', {
                user_id: user.id
              })
            ).then(({ data }) => {
              console.log("Direct admin check result:", data);
              setIsAdmin(!!data);
              // Update cache
              adminCacheRef.current.set(user.id, !!data);
            }).catch(error => {
              console.error("Direct admin check failed:", error);
            });
          }
        }
      }, 3000); // 3 second timeout
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading, user]);

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

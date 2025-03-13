
import { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { AuthContextType, UserProfile, UserRole } from "./types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/integrations/supabase/client";

// Import our custom hooks
import { useUserProfile } from "./hooks/useUserProfile";
import { useUserRoles } from "./hooks/useUserRoles";
import { useAdminStatus } from "./hooks/useAdminStatus";
import { useAuthActions } from "./hooks/useAuthActions";
import { useSessionManager } from "./hooks/useSessionManager";
import { useSignOut } from "./hooks/useSignOut";
import { useUserDataInitializer } from "./hooks/useUserDataInitializer";
import { useAuthInitializer } from "./hooks/useAuthInitializer";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  const [sessionToken, setSessionToken] = useLocalStorage<string | null>("supabase_auth_token", null);
  
  // Initialize our custom hooks
  const { checkAdminStatus, adminCache } = useAdminStatus();
  const { fetchUserProfile, profileCache } = useUserProfile();
  const { fetchUserRoles, roleCache } = useUserRoles();
  
  const { initializeUserData } = useUserDataInitializer(
    setIsAdmin,
    setProfile,
    setUserRoles,
    setLoading,
    checkAdminStatus,
    fetchUserProfile,
    fetchUserRoles
  );
  
  const { signIn, signUp, resetPassword, updatePassword } = useAuthActions(setSessionToken);
  
  const { refreshSession } = useSessionManager(
    setUser,
    setSessionToken,
    setLoading,
    initializeUserData
  );
  
  const { signOut } = useSignOut(
    setUser,
    setProfile,
    setUserRoles,
    setIsAdmin,
    setSessionToken,
    setLoading,
    adminCache,
    profileCache,
    roleCache
  );
  
  // Initialize auth state
  useAuthInitializer(
    initialized,
    sessionToken,
    setUser,
    setSessionToken,
    setProfile,
    setUserRoles,
    setIsAdmin,
    setLoading,
    setInitialized,
    initializeUserData,
    adminCache,
    profileCache,
    roleCache
  );
  
  // Add session refresh interval
  useEffect(() => {
    if (!user || !sessionToken) return;
    
    const refreshInterval = setInterval(() => {
      refreshSession();
    }, 23 * 60 * 1000); // Refresh 23 minutes
    
    return () => clearInterval(refreshInterval);
  }, [user, sessionToken, refreshSession]);

  // Add timeout for loading state
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
              adminCache.set(user.id, !!data);
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
  }, [loading, user, adminCache]);

  // Create the context value with all auth methods and state
  const contextValue = useMemo(() => ({
    user,
    profile,
    isAdmin,
    userRoles,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession
  }), [
    user, 
    profile, 
    isAdmin, 
    userRoles, 
    loading, 
    signIn, 
    signUp, 
    signOut, 
    resetPassword, 
    updatePassword, 
    refreshSession
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

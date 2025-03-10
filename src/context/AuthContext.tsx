
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, AuthChangeEvent } from "@supabase/supabase-js";
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

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
  
  // Create a client-side cache for admin status to prevent repeated checks
  const adminCache = useMemo(() => new Map<string, boolean>(), []);
  
  // Optimized function to check admin status with caching
  const checkAdminStatus = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setIsAdmin(false);
      return false;
    }

    // Check cache first
    if (adminCache.has(userId)) {
      const cachedValue = adminCache.get(userId);
      setIsAdmin(!!cachedValue);
      return cachedValue;
    }

    try {
      console.log("Checking admin status for user:", userId);
      const { data, error } = await supabase.rpc('check_is_admin', {
        user_id: userId
      });

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return false;
      }
      
      console.log("Admin status check result:", data);
      
      // Cache the result
      adminCache.set(userId, !!data);
      setIsAdmin(!!data);
      return !!data;
    } catch (error) {
      console.error('Exception checking admin status:', error);
      setIsAdmin(false);
      return false;
    }
  }, [adminCache]);

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear any client-side state first
      setUser(null);
      setIsAdmin(false);
      adminCache.clear();
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success("Logged out successfully");
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Error signing out");
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth state
  useEffect(() => {
    if (initialized) return; // Prevent multiple initializations
    
    let isMounted = true;
    const controller = new AbortController();
    
    const initializeAuth = async () => {
      try {
        if (!isMounted) return;
        
        setLoading(true);
        
        // Check current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          throw sessionError;
        }
        
        if (sessionData?.session?.user) {
          if (isMounted) {
            console.log("Session found, setting user and checking admin status");
            setUser(sessionData.session.user);
            await checkAdminStatus(sessionData.session.user.id);
          }
        } else {
          console.log("No active session found");
        }
        
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };
    
    initializeAuth();
    
    // Auth state change listener with improved error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        if (controller.signal.aborted || !isMounted) return;
        
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (isMounted) setLoading(true);
          
          if (session?.user) {
            if (isMounted) {
              console.log("User signed in or token refreshed, setting user and checking admin status");
              setUser(session.user);
              await checkAdminStatus(session.user.id);
            }
          }
          
          if (isMounted) setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            console.log("User signed out, clearing user and admin status");
            setUser(null);
            setIsAdmin(false);
            adminCache.clear(); // Clear cache on sign out
          }
        }
      }
    );
    
    // Clean up function
    return () => {
      isMounted = false;
      controller.abort();
      subscription.unsubscribe();
    };
  }, [checkAdminStatus, adminCache, initialized]);

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

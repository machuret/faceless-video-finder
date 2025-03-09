
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
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
  const [authChecked, setAuthChecked] = useState(false);
  
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
      const { data, error } = await supabase.rpc('check_is_admin', {
        user_id: userId
      });

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return false;
      }
      
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
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      
      window.location.href = '/admin/login';
      toast.success("Logged out successfully");
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Error signing out");
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth once
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Check current session
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          if (isMounted) {
            setLoading(false);
            setAuthChecked(true);
          }
          return;
        }
        
        if (sessionData?.session?.user) {
          if (isMounted) {
            setUser(sessionData.session.user);
            await checkAdminStatus(sessionData.session.user.id);
          }
        }
        
        if (isMounted) {
          setLoading(false);
          setAuthChecked(true);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        if (isMounted) {
          setLoading(false);
          setAuthChecked(true);
        }
      }
    };
    
    initializeAuth();
    
    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (controller.signal.aborted) return;
        
        if (isMounted) {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setLoading(true);
            
            if (session?.user) {
              setUser(session.user);
              await checkAdminStatus(session.user.id);
            }
            
            setLoading(false);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setIsAdmin(false);
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
  }, [checkAdminStatus]);

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

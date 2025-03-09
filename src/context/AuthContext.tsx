
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
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // Memoized function to check admin status - optimized with caching
  const checkAdminStatus = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setIsAdmin(false);
      return false;
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
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log("Admin check result:", data);
      }
      
      setIsAdmin(!!data);
      return !!data;
    } catch (error) {
      console.error('Exception checking admin status:', error);
      setIsAdmin(false);
      return false;
    }
  }, []);

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

  // Initialize auth - optimized to run only once
  useEffect(() => {
    if (authInitialized) return;
    
    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;
    
    const initializeAuth = async () => {
      try {
        // If canceled, don't proceed
        if (signal.aborted) return;
        
        setLoading(true);
        
        // Check current session
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (signal.aborted) return;
        
        if (error) {
          console.error("Error getting session:", error);
          setLoading(false);
          return;
        }
        
        if (sessionData?.session?.user) {
          if (process.env.NODE_ENV === 'development') {
            console.log("Found existing user session:", sessionData.session.user.email);
          }
          
          setUser(sessionData.session.user);
          await checkAdminStatus(sessionData.session.user.id);
        }
        
        setAuthInitialized(true);
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        if (isMounted && !signal.aborted) {
          setLoading(false);
        }
      }
    };
    
    initializeAuth();
    
    // Clean up function
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [authInitialized, checkAdminStatus]);
  
  // Set up auth state change listener - separate from initialization
  useEffect(() => {
    // Set up auth state change listener
    if (process.env.NODE_ENV === 'development') {
      console.log("Setting up auth state change listener");
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (process.env.NODE_ENV === 'development') {
          console.log("Auth state changed:", event, session?.user?.email);
        }
        
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
    );
    
    // Clean up subscription on unmount
    return () => {
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

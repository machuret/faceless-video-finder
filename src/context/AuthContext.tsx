
import { createContext, useContext, useEffect, useState } from "react";
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
  
  const checkAdminStatus = async (userId: string | undefined) => {
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
      
      console.log("Admin check result:", data);
      setIsAdmin(!!data);
      return !!data;
    } catch (error) {
      console.error('Exception checking admin status:', error);
      setIsAdmin(false);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      
      // Use window.location instead of navigate hook
      window.location.href = '/admin/login';
      toast.success("Logged out successfully");
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Error signing out");
    }
  };

  useEffect(() => {
    console.log("Auth Provider mounted");
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        if (isMounted) setLoading(true);
        
        // Check current session
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          if (isMounted) setLoading(false);
          return;
        }
        
        if (isMounted && sessionData?.session?.user) {
          console.log("Found existing user session:", sessionData.session.user.email);
          setUser(sessionData.session.user);
          await checkAdminStatus(sessionData.session.user.id);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    initializeAuth();
    
    // Set up auth state change listener
    console.log("Setting up auth state change listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (!isMounted) {
          console.log("Component unmounted, ignoring auth state change");
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (isMounted) setLoading(true);
          
          if (session?.user) {
            if (isMounted) {
              console.log("Setting user after auth change:", session.user.email);
              setUser(session.user);
              await checkAdminStatus(session.user.id);
            }
          }
          
          if (isMounted) setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            console.log("User signed out, clearing user state");
            setUser(null);
            setIsAdmin(false);
          }
        }
      }
    );
    
    // Clean up subscription and mounted flag on unmount
    return () => {
      console.log("Auth Provider unmounting, cleaning up");
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove navigate dependency

  const contextValue = {
    user,
    isAdmin,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

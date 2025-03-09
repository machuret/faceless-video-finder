
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  // Improved admin check function with better error handling
  const checkAdminStatus = async (userId: string) => {
    if (!userId) return false;

    try {
      console.log(`Checking admin status for user: ${userId}`);
      
      // Direct query using RPC to check admin status
      const { data, error } = await supabase.rpc('check_is_admin', {
        user_id: userId
      });

      if (error) {
        console.error('Error checking admin status:', error);
        toast.error('Error verifying admin permissions');
        return false;
      }
      
      const isUserAdmin = !!data;
      console.log(`Admin check result: ${isUserAdmin}`);
      
      return isUserAdmin;
    } catch (error) {
      console.error('Error in admin check:', error);
      toast.error('Error verifying permissions');
      return false;
    }
  };

  // Improved auth initialization function with better error handling
  const initializeAuth = async () => {
    try {
      setLoading(true);
      console.log("Initializing auth session...");
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setUser(null);
        setIsAdmin(false);
        return;
      }
      
      const session = sessionData?.session;
      
      if (!session) {
        console.log("No active session found");
        setUser(null);
        setIsAdmin(false);
        return;
      }

      // We have a valid session with a user
      console.log(`Session found for user: ${session.user.id}`);
      setUser(session.user);
      
      // Check admin status and update state accordingly
      const adminStatus = await checkAdminStatus(session.user.id);
      setIsAdmin(adminStatus);
      
    } catch (error) {
      console.error("Auth initialization error:", error);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth on mount and set up auth state change listener
  useEffect(() => {
    // Initialize auth on component mount
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            console.log(`User signed in: ${session.user.id}`);
            setUser(session.user);
            
            // Set admin status
            const adminStatus = await checkAdminStatus(session.user.id);
            console.log(`Updated admin status: ${adminStatus}`);
            setIsAdmin(adminStatus);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUser(null);
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      navigate("/admin/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    user,
    isAdmin,
    loading,
    signOut
  };

  console.log("Auth context current state:", { 
    userId: user?.id, 
    isAdmin, 
    loading 
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

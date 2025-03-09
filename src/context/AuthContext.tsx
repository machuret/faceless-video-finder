
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

  // Check if a user is an admin
  const checkAdminStatus = async (userId: string) => {
    if (!userId) return false;

    try {
      console.log(`Checking admin status for user: ${userId}`);
      
      // Call the RPC function to check admin status
      const { data, error } = await supabase.rpc('check_is_admin', {
        user_id: userId
      });

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      const isUserAdmin = !!data;
      console.log(`Admin check result: ${isUserAdmin}`);
      
      return isUserAdmin;
    } catch (error) {
      console.error('Error in admin check:', error);
      return false;
    }
  };

  // Initialize auth state
  const initializeAuth = async () => {
    try {
      setLoading(true);
      console.log("Initializing auth session...");
      
      // Get current session
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
      
      // Check admin status
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

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();

    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`);
        
        if (session?.user) {
          console.log(`User session updated: ${session.user.id}`);
          setUser(session.user);
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            // Update admin status when signed in or token refreshed
            const adminStatus = await checkAdminStatus(session.user.id);
            setIsAdmin(adminStatus);
          }
        } else {
          // No session means signed out
          console.log('No user session');
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

  // Sign out function
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

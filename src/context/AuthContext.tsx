
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

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
  
  const checkAdminStatus = async (userId: string | undefined) => {
    console.log("Checking admin status for userId:", userId);
    
    if (!userId) {
      console.log("No userId provided, setting isAdmin to false");
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
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("AuthProvider: Initializing");
      setLoading(true);
      
      try {
        // Check current session
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("Initial session check:", sessionData?.session ? "Session exists" : "No session");
        
        if (sessionData?.session?.user) {
          setUser(sessionData.session.user);
          await checkAdminStatus(sessionData.session.user.id);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
      
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event, session?.user?.id);
          
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
        console.log("AuthProvider: Cleaning up subscription");
        subscription.unsubscribe();
      };
    };
    
    initializeAuth();
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};


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

  const checkAdminStatus = async (userId: string) => {
    if (!userId) {
      console.log("No user ID to check admin status");
      setIsAdmin(false);
      return false;
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
      
      console.log("Admin check result:", data);
      setIsAdmin(!!data);
      return !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const initAuth = async () => {
      try {
        console.log("Initializing auth...");
        if (mounted) setLoading(true);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          if (mounted) {
            setUser(null);
            setIsAdmin(false);
            setLoading(false);
          }
          return;
        }
        
        console.log("Session retrieved:", session ? "Yes" : "No");
        
        if (session?.user) {
          if (mounted) setUser(session.user);
          if (mounted && session.user.id) {
            await checkAdminStatus(session.user.id);
          }
        } else {
          if (mounted) {
            setUser(null);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error("Error getting session:", error);
        if (mounted) {
          setUser(null);
          setIsAdmin(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Session exists" : "No session");
      
      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          await checkAdminStatus(session.user.id);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log("Signing out...");
      setLoading(true);
      await supabase.auth.signOut();
      navigate("/admin/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

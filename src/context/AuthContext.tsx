
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

  const checkAdminStatus = async (userId: string | undefined) => {
    if (!userId) {
      console.log("No user ID to check admin status");
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      console.log("Checking admin status for user:", userId);
      const { data, error } = await supabase.rpc('check_is_admin', {
        user_id: userId
      });

      if (error) {
        console.error('Error checking admin status:', error);
        throw error;
      }
      
      console.log("Admin check result:", data);
      setIsAdmin(!!data); // Ensure boolean value
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      console.log("Admin status check complete, setting loading to false");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      try {
        console.log("Getting session...");
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log("Session retrieved:", session ? "Yes" : "No");
        setUser(session?.user ?? null);
        
        if (session?.user?.id) {
          console.log("Session has user, checking admin status");
          await checkAdminStatus(session.user.id);
        } else {
          console.log("No user in session, setting loading to false");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error getting session:", error);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session ? "Session exists" : "No session");
      setUser(session?.user ?? null);
      
      if (session?.user?.id) {
        console.log("Auth state change has user, checking admin status");
        await checkAdminStatus(session.user.id);
      } else {
        console.log("No user in auth state change, setting loading to false");
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      console.log("Signing out...");
      await supabase.auth.signOut();
      navigate("/admin/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

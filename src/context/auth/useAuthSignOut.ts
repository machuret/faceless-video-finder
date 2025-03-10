
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthSignOut = (
  setUser: (user: null) => void,
  setIsAdmin: (isAdmin: boolean) => void,
  setLoading: (loading: boolean) => void,
  adminCache: Map<string, boolean>
) => {
  return async () => {
    try {
      setLoading(true);
      
      // Clear client-side state first
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
};

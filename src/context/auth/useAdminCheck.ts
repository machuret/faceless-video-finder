
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminCheck = (setIsAdmin: (isAdmin: boolean) => void, setLoading: (loading: boolean) => void) => {
  return useCallback(async (userId: string | undefined) => {
    if (!userId) {
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
      
      console.log("Admin status check result:", data);
      setIsAdmin(!!data);
      return !!data;
    } catch (error) {
      console.error('Exception checking admin status:', error);
      setIsAdmin(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setIsAdmin, setLoading]);
};

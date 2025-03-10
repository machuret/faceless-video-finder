import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminCheck = (setIsAdmin: (isAdmin: boolean) => void, setLoading: (loading: boolean) => void) => {
  // Keep a cache of admin status checks to avoid excessive DB calls
  const adminStatusCache = new Map<string, boolean>();
  
  return useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setIsAdmin(false);
      setLoading(false);
      return false;
    }

    // Check if we have a cached result
    if (adminStatusCache.has(userId)) {
      const isAdmin = adminStatusCache.get(userId);
      console.log("Using cached admin status:", isAdmin);
      setIsAdmin(isAdmin || false);
      setLoading(false);
      return isAdmin;
    }

    try {
      console.log("Checking admin status for user:", userId);
      const { data, error } = await supabase.rpc('check_is_admin', {
        user_id: userId
      });

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setLoading(false);
        return false;
      }
      
      console.log("Admin status check result:", data);
      // Cache the result
      adminStatusCache.set(userId, !!data);
      setIsAdmin(!!data);
      setLoading(false);
      return !!data;
    } catch (error) {
      console.error('Exception checking admin status:', error);
      setIsAdmin(false);
      setLoading(false);
      return false;
    }
  }, [setIsAdmin, setLoading]);
};

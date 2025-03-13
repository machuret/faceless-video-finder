
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminStatus = () => {
  const adminCache = new Map<string, boolean>();

  const checkAdminStatus = useCallback(async (userId: string) => {
    if (adminCache.has(userId)) {
      const isAdmin = adminCache.get(userId);
      return isAdmin;
    }

    try {
      const { data: adminData, error: adminError } = await supabase.rpc('check_is_admin', {
        user_id: userId
      });

      if (adminError) {
        console.error('Error checking admin status:', adminError);
        return false;
      }
      
      adminCache.set(userId, !!adminData);
      return !!adminData;
    } catch (error) {
      console.error('Exception checking admin status:', error);
      return false;
    }
  }, []);

  return { checkAdminStatus, adminCache };
};

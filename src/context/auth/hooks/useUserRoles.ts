
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "../types";

export const useUserRoles = () => {
  const roleCache = new Map<string, UserRole[]>();

  const fetchUserRoles = useCallback(async (userId: string) => {
    if (roleCache.has(userId)) {
      return roleCache.get(userId) as UserRole[];
    }
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error("Error fetching user roles:", error);
        return [];
      }
      
      if (data && data.length > 0) {
        roleCache.set(userId, data as UserRole[]);
        return data as UserRole[];
      }
      
      return [];
    } catch (error) {
      console.error("Exception fetching user roles:", error);
      return [];
    }
  }, []);

  return { fetchUserRoles, roleCache };
};

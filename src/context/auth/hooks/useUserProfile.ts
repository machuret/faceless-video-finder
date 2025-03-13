
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "../types";

export const useUserProfile = () => {
  const profileCache = new Map<string, UserProfile>();

  const fetchUserProfile = useCallback(async (userId: string) => {
    if (profileCache.has(userId)) {
      return profileCache.get(userId) as UserProfile;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      
      if (data) {
        profileCache.set(userId, data as UserProfile);
        return data as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error("Exception fetching user profile:", error);
      return null;
    }
  }, []);

  return { fetchUserProfile, profileCache };
};

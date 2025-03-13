
import { useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile, UserRole } from "../types";

export const useSignOut = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>,
  setUserRoles: React.Dispatch<React.SetStateAction<UserRole[]>>,
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>,
  setSessionToken: (token: string | null) => void,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  adminCache: Map<string, boolean>,
  profileCache: Map<string, UserProfile>,
  roleCache: Map<string, UserRole[]>
) => {
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
      setUser(null);
      setProfile(null);
      setUserRoles([]);
      setIsAdmin(false);
      setSessionToken(null);
      
      adminCache.clear();
      profileCache.clear();
      roleCache.clear();
      
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
  }, [
    setUser, 
    setProfile, 
    setUserRoles, 
    setIsAdmin, 
    setSessionToken, 
    setLoading, 
    adminCache, 
    profileCache, 
    roleCache
  ]);

  return { signOut };
};

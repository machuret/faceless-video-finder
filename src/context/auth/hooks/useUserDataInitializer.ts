
import { useCallback } from "react";
import { User } from "@supabase/supabase-js";

type CheckAdminFn = (userId: string) => Promise<boolean>;
type FetchProfileFn = (userId: string) => Promise<any>;
type FetchRolesFn = (userId: string) => Promise<any[]>;

export const useUserDataInitializer = (
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>,
  setProfile: React.Dispatch<React.SetStateAction<any>>,
  setUserRoles: React.Dispatch<React.SetStateAction<any[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  checkAdminStatus: CheckAdminFn,
  fetchUserProfile: FetchProfileFn,
  fetchUserRoles: FetchRolesFn
) => {
  const initializeUserData = useCallback(async (user: User) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const [adminStatus, userProfile, userRoles] = await Promise.all([
        checkAdminStatus(user.id),
        fetchUserProfile(user.id),
        fetchUserRoles(user.id),
      ]);
      
      setIsAdmin(adminStatus);
      setProfile(userProfile);
      setUserRoles(userRoles);
    } catch (error) {
      console.error("Error initializing user data:", error);
    } finally {
      setLoading(false);
    }
  }, [checkAdminStatus, fetchUserProfile, fetchUserRoles, setIsAdmin, setProfile, setUserRoles, setLoading]);

  return { initializeUserData };
};


import { useEffect } from "react";
import { User, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuthInitializer = (
  initialized: boolean,
  sessionToken: string | null,
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setSessionToken: (token: string | null) => void,
  setProfile: React.Dispatch<React.SetStateAction<any | null>>,
  setUserRoles: React.Dispatch<React.SetStateAction<any[]>>,
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setInitialized: React.Dispatch<React.SetStateAction<boolean>>,
  initializeUserData: (user: User) => Promise<void>,
  adminCache: Map<string, boolean>,
  profileCache: Map<string, any>,
  roleCache: Map<string, any[]>
) => {
  useEffect(() => {
    if (initialized) return;
    
    let isMounted = true;
    let authListener: { data: { subscription: { unsubscribe: () => void } } };
    
    const initializeAuth = async () => {
      try {
        if (!isMounted) return;
        
        console.log("Initializing auth state...");
        
        if (sessionToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error("Error getting session:", sessionError);
            setSessionToken(null);
          } else if (sessionData?.session?.user) {
            console.log("Session found, setting user");
            setUser(sessionData.session.user);
            await initializeUserData(sessionData.session.user);
          }
        } else {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error("Error getting session:", sessionError);
          } else if (sessionData?.session?.user) {
            console.log("Session found, setting user");
            setUser(sessionData.session.user);
            setSessionToken(sessionData.session.access_token);
            await initializeUserData(sessionData.session.user);
          } else {
            console.log("No active session found");
            setUser(null);
            setProfile(null);
            setUserRoles([]);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };
    
    initializeAuth();
    
    authListener = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setUser(session.user);
          setSessionToken(session.access_token);
          await initializeUserData(session.user);
        }
      } 
      else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setUserRoles([]);
        setIsAdmin(false);
        setSessionToken(null);
        adminCache.clear();
        profileCache.clear();
        roleCache.clear();
      }
    });
    
    return () => {
      isMounted = false;
      if (authListener?.data?.subscription) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, [
    initialized, 
    sessionToken, 
    setUser, 
    setSessionToken, 
    setProfile, 
    setUserRoles, 
    setIsAdmin, 
    setLoading, 
    setInitialized, 
    initializeUserData,
    adminCache,
    profileCache,
    roleCache
  ]);
};

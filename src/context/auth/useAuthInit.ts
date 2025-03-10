
import { useEffect } from "react";
import { User, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuthInit = (
  initialized: boolean,
  setUser: (user: User | null) => void,
  setLoading: (loading: boolean) => void,
  setInitialized: (initialized: boolean) => void,
  checkAdminStatus: (userId: string) => Promise<boolean>
) => {
  useEffect(() => {
    if (initialized) return;
    
    let isMounted = true;
    const controller = new AbortController();
    
    const initializeAuth = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        
        console.log("Initializing auth state...");
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          throw sessionError;
        }
        
        if (sessionData?.session?.user) {
          if (isMounted) {
            console.log("Session found, setting user");
            setUser(sessionData.session.user);
            
            // Set a timeout for admin check to prevent blocking the UI
            setTimeout(async () => {
              if (isMounted) {
                console.log("Checking admin status");
                await checkAdminStatus(sessionData.session.user.id);
              }
            }, 100);
          }
        } else {
          console.log("No active session found");
          if (isMounted) setLoading(false);
        }
        
        if (isMounted) {
          setInitialized(true);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };
    
    initializeAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        if (controller.signal.aborted || !isMounted) return;
        
        console.log("Auth state changed:", event);
        
        try {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.user) {
              if (isMounted) {
                console.log(`${event}: Setting user`);
                setUser(session.user);
                setLoading(true);
                
                // Set a timeout for admin check to prevent blocking the UI
                setTimeout(async () => {
                  if (isMounted) {
                    console.log("Checking admin status");
                    await checkAdminStatus(session.user.id);
                    if (isMounted) setLoading(false);
                  }
                }, 100);
              }
            }
          } 
          else if (event === 'SIGNED_OUT') {
            if (isMounted) {
              console.log("User signed out, clearing user and admin status");
              setUser(null);
              setLoading(false);
            }
          }
        } catch (error) {
          console.error("Error handling auth state change:", error);
          if (isMounted) setLoading(false);
        }
      }
    );
    
    return () => {
      isMounted = false;
      controller.abort();
      subscription.unsubscribe();
    };
  }, [initialized, setUser, setLoading, setInitialized, checkAdminStatus]);
};

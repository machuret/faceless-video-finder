
import { useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useSessionManager = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setSessionToken: (token: string | null) => void,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  initializeUserData: (user: User) => Promise<void>
) => {
  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Error refreshing session:", error);
        // Handle sign out separately to avoid circular dependencies
        setUser(null);
        setSessionToken(null);
        setLoading(false);
        return;
      }
      
      if (data?.session) {
        setSessionToken(data.session.access_token);
        if (data.user) {
          setUser(data.user);
          await initializeUserData(data.user);
        }
      }
    } catch (error) {
      console.error("Exception refreshing session:", error);
    } finally {
      setLoading(false);
    }
  }, [setUser, setSessionToken, setLoading, initializeUserData]);

  return { refreshSession };
};

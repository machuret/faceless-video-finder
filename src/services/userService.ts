
import { supabase } from "@/integrations/supabase/client";

export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase.rpc('check_is_admin', {
      user_id: userId
    });
    
    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

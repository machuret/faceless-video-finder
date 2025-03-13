
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserListResponse } from "@/types/user";

export const useUsersList = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ['admin-users', page, pageSize],
    queryFn: async (): Promise<UserListResponse> => {
      try {
        // Call the edge function to get users with admin check
        const { data, error } = await supabase.functions.invoke('get-users', {
          body: { page, pageSize }
        });
        
        if (error) {
          console.error("Error fetching users:", error);
          throw new Error(error.message);
        }
        
        return data;
      } catch (error: any) {
        console.error("Error in useUsersList:", error);
        toast.error(`Failed to load users: ${error.message}`);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - users don't change that often
    refetchOnWindowFocus: false,
  });
};

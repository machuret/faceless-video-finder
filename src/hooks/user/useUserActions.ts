
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserActions = () => {
  const queryClient = useQueryClient();

  const toggleAdminStatus = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string, isAdmin: boolean }) => {
      const { data, error } = await supabase.functions.invoke('update-user-admin-status', {
        body: { userId, isAdmin }
      });
      
      if (error) {
        console.error("Error updating admin status:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success("User admin status updated successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update admin status: ${error.message}`);
    }
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });
      
      if (error) {
        console.error("Error deleting user:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete user: ${error.message}`);
    }
  });

  return {
    toggleAdminStatus,
    deleteUser
  };
};

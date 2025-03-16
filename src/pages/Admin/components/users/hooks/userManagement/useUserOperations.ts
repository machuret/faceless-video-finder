import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "../useUserForm";
import { UserFormValues } from "../../schema/userFormSchema";

export const useUserOperations = (fetchUsers: (searchTerm: string) => Promise<any>) => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const handleUserSave = async (userData: UserFormValues): Promise<void> => {
    try {
      // Update existing user
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: userData.display_name,
          first_name: userData.first_name,
          last_name: userData.last_name
        })
        .eq("id", userData.id);
      
      if (error) throw error;
      
      toast.success("User updated successfully");
      
      fetchUsers("");
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error(error.message || "Failed to save user");
    }
  };

  const handleUserDelete = async (userId: string) => {
    if (!userId) return false;
    
    try {
      // Admin function to delete a user
      const { error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId }
      });
      
      if (error) throw error;
      
      toast.success("User deleted successfully");
      fetchUsers("");
      return true;
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
      return false;
    }
  };

  const handleUserSuspend = async (userId: string, suspend: boolean) => {
    if (!userId) return false;
    
    try {
      // Admin function to suspend/unsuspend a user
      const { error } = await supabase.functions.invoke('admin-update-user-status', {
        body: { userId, suspend }
      });
      
      if (error) throw error;
      
      toast.success(suspend ? "User suspended successfully" : "User unsuspended successfully");
      fetchUsers("");
      return true;
    } catch (error: any) {
      console.error("Error updating user status:", error);
      toast.error(error.message || "Failed to update user status");
      return false;
    }
  };

  const handleBulkDelete = async (): Promise<void> => {
    if (selectedUserIds.length === 0) return;
    
    try {
      // Admin function to delete multiple users
      const { error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userIds: selectedUserIds }
      });
      
      if (error) throw error;
      
      toast.success(`${selectedUserIds.length} users deleted successfully`);
      setSelectedUserIds([]);
      fetchUsers("");
    } catch (error: any) {
      console.error("Error deleting users:", error);
      toast.error(error.message || "Failed to delete users");
    }
  };

  const handleSelectUser = (userId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedUserIds(prev => [...prev, userId]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAllUsers = (users: User[], isSelected: boolean) => {
    if (isSelected) {
      setSelectedUserIds(users.map(user => user.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  return {
    selectedUserIds,
    setSelectedUserIds,
    handleUserSave,
    handleUserDelete,
    handleUserSuspend,
    handleBulkDelete,
    handleSelectUser,
    handleSelectAllUsers
  };
};

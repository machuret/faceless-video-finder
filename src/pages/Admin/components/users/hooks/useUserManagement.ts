
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "./useUserForm";
import { UserFormValues } from "../schema/userFormSchema";

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const fetchUsers = async (debouncedSearchTerm: string) => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from("profiles")
        .select("id, first_name, last_name, display_name, email, created_at");
      
      if (debouncedSearchTerm) {
        query = query.or(
          `first_name.ilike.%${debouncedSearchTerm}%,last_name.ilike.%${debouncedSearchTerm}%,email.ilike.%${debouncedSearchTerm}%`
        );
      }
        
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(error.message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (user: User | null = null, editing = false) => {
    setSelectedUser(user);
    setIsEditing(editing);
    setIsDialogOpen(true);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleUserSave = async (userData: UserFormValues) => {
    try {
      if (isEditing && selectedUser) {
        // Update existing user
        const { error } = await supabase
          .from("profiles")
          .update({
            display_name: userData.display_name,
            first_name: userData.first_name,
            last_name: userData.last_name
          })
          .eq("id", selectedUser.id);
        
        if (error) throw error;
        
        toast.success("User updated successfully");
      } else {
        // For creating a new user - not implemented here as it's handled by auth system
        toast.info("User creation should be done through the registration process");
      }
      
      setIsDialogOpen(false);
      fetchUsers("");
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error(error.message || "Failed to save user");
    }
  };

  const handleUserDelete = async () => {
    if (!selectedUser) return;
    
    try {
      // Admin function to delete a user
      const { error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId: selectedUser.id }
      });
      
      if (error) throw error;
      
      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      fetchUsers("");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    }
  };

  const getFullName = (user: User) => {
    if (user.display_name) return user.display_name;
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    if (user.first_name) return user.first_name;
    if (user.last_name) return user.last_name;
    return "-";
  };

  return {
    users,
    isLoading,
    searchTerm,
    selectedUser,
    isDialogOpen,
    isDeleteDialogOpen,
    isEditing,
    setSearchTerm,
    fetchUsers,
    handleOpenDialog,
    handleOpenDeleteDialog,
    handleUserSave,
    handleUserDelete,
    getFullName,
    setIsDialogOpen,
    setIsDeleteDialogOpen
  };
};

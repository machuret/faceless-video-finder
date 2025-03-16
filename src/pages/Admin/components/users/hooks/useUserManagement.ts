
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
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  const fetchUsers = async (debouncedSearchTerm: string) => {
    try {
      setIsLoading(true);
      
      // First fetch from profiles table
      let query = supabase
        .from("profiles")
        .select("id, first_name, last_name, display_name, email, created_at");
      
      if (debouncedSearchTerm) {
        query = query.or(
          `first_name.ilike.%${debouncedSearchTerm}%,last_name.ilike.%${debouncedSearchTerm}%,email.ilike.%${debouncedSearchTerm}%`
        );
      }
        
      const { data: profilesData, error: profilesError } = await query.order("created_at", { ascending: false });
      
      if (profilesError) throw profilesError;
      
      console.log("Profiles fetched:", profilesData?.length);
      
      // Also fetch users directly from auth.users through the admin-get-users edge function
      // to catch any users that might be in auth but not in profiles
      const { data: authUsersData, error: authUsersError } = await supabase.functions.invoke('admin-get-users', {
        body: {}
      });
      
      if (authUsersError) {
        console.error("Error fetching auth users:", authUsersError);
      } else {
        console.log("Auth users fetched:", authUsersData?.length);
      }
      
      // Combine data from both sources
      const combinedUsers = new Map<string, User>();
      
      // First add profile data
      profilesData?.forEach(profile => {
        combinedUsers.set(profile.id, {
          id: profile.id,
          email: profile.email || "",
          display_name: profile.display_name || "",
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          created_at: profile.created_at,
          banned_until: null
        });
      });
      
      // Then add or update with auth data
      if (authUsersData && Array.isArray(authUsersData)) {
        authUsersData.forEach(authUser => {
          if (!combinedUsers.has(authUser.id)) {
            // This user exists in auth but not in profiles
            combinedUsers.set(authUser.id, {
              id: authUser.id,
              email: authUser.email || "",
              display_name: "",
              first_name: "",
              last_name: "",
              created_at: authUser.created_at || new Date().toISOString(),
              banned_until: authUser.banned_until
            });
          } else {
            // Update existing entry with auth data
            const existingUser = combinedUsers.get(authUser.id)!;
            existingUser.banned_until = authUser.banned_until;
            if (!existingUser.email && authUser.email) {
              existingUser.email = authUser.email;
            }
            combinedUsers.set(authUser.id, existingUser);
          }
        });
      }
      
      // Convert map to array and filter by search term if needed
      let usersArray = Array.from(combinedUsers.values());
      
      if (debouncedSearchTerm) {
        usersArray = usersArray.filter(user => 
          user.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
          user.first_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
          user.last_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          user.display_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
      }
      
      // Sort by created_at descending
      usersArray.sort((a, b) => {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
      
      setUsers(usersArray);
      // Clear selections when users list changes
      setSelectedUserIds([]);
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

  const handleOpenSuspendDialog = (user: User) => {
    setSelectedUser(user);
    setIsSuspendDialogOpen(true);
  };

  const handleOpenBulkDeleteDialog = () => {
    setIsBulkDeleteDialogOpen(true);
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

  const handleUserSuspend = async (suspend: boolean) => {
    if (!selectedUser) return;
    
    try {
      // Admin function to suspend/unsuspend a user
      const { error } = await supabase.functions.invoke('admin-update-user-status', {
        body: { userId: selectedUser.id, suspend }
      });
      
      if (error) throw error;
      
      toast.success(suspend ? "User suspended successfully" : "User unsuspended successfully");
      setIsSuspendDialogOpen(false);
      fetchUsers("");
    } catch (error: any) {
      console.error("Error updating user status:", error);
      toast.error(error.message || "Failed to update user status");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    
    try {
      // Admin function to delete multiple users
      const { error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userIds: selectedUserIds }
      });
      
      if (error) throw error;
      
      toast.success(`${selectedUserIds.length} users deleted successfully`);
      setIsBulkDeleteDialogOpen(false);
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

  const handleSelectAllUsers = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedUserIds(users.map(user => user.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const getFullName = (user: User) => {
    if (user.display_name) return user.display_name;
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    if (user.first_name) return user.first_name;
    if (user.last_name) return user.last_name;
    return "-";
  };

  const isUserSuspended = (user: User): boolean => {
    if (!user.banned_until) return false;
    const bannedUntil = new Date(user.banned_until);
    return bannedUntil > new Date();
  };

  return {
    users,
    isLoading,
    searchTerm,
    selectedUser,
    isDialogOpen,
    isDeleteDialogOpen,
    isBulkDeleteDialogOpen,
    isSuspendDialogOpen,
    isEditing,
    selectedUserIds,
    setSearchTerm,
    fetchUsers,
    handleOpenDialog,
    handleOpenDeleteDialog,
    handleOpenSuspendDialog,
    handleOpenBulkDeleteDialog,
    handleUserSave,
    handleUserDelete,
    handleUserSuspend,
    handleBulkDelete,
    handleSelectUser,
    handleSelectAllUsers,
    getFullName,
    isUserSuspended,
    setIsDialogOpen,
    setIsDeleteDialogOpen,
    setIsBulkDeleteDialogOpen,
    setIsSuspendDialogOpen
  };
};

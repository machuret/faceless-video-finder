
import { useState } from "react";
import { User } from "./useUserForm";
import { UserFormValues } from "../schema/userFormSchema";
import { useUserDataFetching } from "./userManagement/useUserDataFetching";
import { useUserDialogState } from "./userManagement/useUserDialogState";
import { useUserOperations } from "./userManagement/useUserOperations";
import { useUserUtils } from "./userManagement/useUserUtils";

export const useUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use our refactored hooks
  const { 
    users, 
    setUsers, 
    isLoading, 
    fetchUsers 
  } = useUserDataFetching();
  
  const {
    selectedUser,
    isDialogOpen,
    isDeleteDialogOpen,
    isBulkDeleteDialogOpen,
    isSuspendDialogOpen,
    isEditing,
    setIsDialogOpen,
    setIsDeleteDialogOpen,
    setIsBulkDeleteDialogOpen,
    setIsSuspendDialogOpen,
    handleOpenDialog,
    handleOpenDeleteDialog,
    handleOpenSuspendDialog,
    handleOpenBulkDeleteDialog
  } = useUserDialogState();
  
  const {
    selectedUserIds,
    setSelectedUserIds,
    handleUserSave,
    handleUserDelete: deleteUser,
    handleUserSuspend: suspendUser,
    handleBulkDelete,
    handleSelectUser,
    handleSelectAllUsers
  } = useUserOperations(fetchUsers);
  
  const { getFullName, isUserSuspended } = useUserUtils();
  
  // Wrapper functions that combine the refactored hooks
  const handleUserDelete = async () => {
    if (!selectedUser) return;
    const success = await deleteUser(selectedUser.id);
    if (success) {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleUserSuspend = async (suspend: boolean) => {
    if (!selectedUser) return;
    const success = await suspendUser(selectedUser.id, suspend);
    if (success) {
      setIsSuspendDialogOpen(false);
    }
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
    handleSelectAllUsers: (isSelected: boolean) => handleSelectAllUsers(users, isSelected),
    getFullName,
    isUserSuspended,
    setIsDialogOpen,
    setIsDeleteDialogOpen,
    setIsBulkDeleteDialogOpen,
    setIsSuspendDialogOpen
  };
};

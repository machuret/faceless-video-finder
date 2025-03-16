
import { useState } from "react";
import { User } from "../useUserForm";

export const useUserDialogState = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  return {
    selectedUser,
    setSelectedUser,
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isBulkDeleteDialogOpen,
    setIsBulkDeleteDialogOpen,
    isSuspendDialogOpen,
    setIsSuspendDialogOpen,
    isEditing,
    setIsEditing,
    handleOpenDialog,
    handleOpenDeleteDialog,
    handleOpenSuspendDialog,
    handleOpenBulkDeleteDialog
  };
};


import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Separator } from "@/components/ui/separator";
import { useDebounce } from "@/hooks/useDebounce";
import UserDialog from "./UserDialog";
import ConfirmDialog from "./ConfirmDialog";
import UserSearchBar from "./components/UserSearchBar";
import UsersTable from "./components/UsersTable";
import { useUserManagement } from "./hooks/useUserManagement";

const UserManagement = () => {
  const {
    users,
    isLoading,
    searchTerm,
    selectedUser,
    isDialogOpen,
    isDeleteDialogOpen,
    isBulkDeleteDialogOpen,
    isEditing,
    selectedUserIds,
    setSearchTerm,
    fetchUsers,
    handleOpenDialog,
    handleOpenDeleteDialog,
    handleOpenBulkDeleteDialog,
    handleUserSave,
    handleUserDelete,
    handleBulkDelete,
    handleSelectUser,
    handleSelectAllUsers,
    getFullName,
    setIsDialogOpen,
    setIsDeleteDialogOpen,
    setIsBulkDeleteDialogOpen
  } = useUserManagement();
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Effect to fetch users when search term changes
  React.useEffect(() => {
    fetchUsers(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <ProtectedRoute requireAdmin>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Button onClick={() => handleOpenDialog(null, false)}>
            <UserPlus className="mr-2 h-4 w-4" />
            New User
          </Button>
        </div>
        
        <Separator />
        
        <UserSearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={() => fetchUsers(debouncedSearchTerm)}
          selectedCount={selectedUserIds.length}
          onBulkDelete={handleOpenBulkDeleteDialog}
        />
        
        <Card>
          <UsersTable 
            users={users}
            isLoading={isLoading}
            getFullName={getFullName}
            onEdit={(user) => handleOpenDialog(user, true)}
            onDelete={handleOpenDeleteDialog}
            selectedUsers={selectedUserIds}
            onSelectUser={handleSelectUser}
            onSelectAllUsers={handleSelectAllUsers}
          />
        </Card>
      </div>
      
      <UserDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleUserSave}
        user={selectedUser}
        isEditing={isEditing}
      />
      
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleUserDelete}
        title="Delete User"
        description={`Are you sure you want to delete the user ${selectedUser?.email}? This action cannot be undone.`}
      />
      
      <ConfirmDialog
        isOpen={isBulkDeleteDialogOpen}
        onClose={() => setIsBulkDeleteDialogOpen(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Users"
        description={`Are you sure you want to delete ${selectedUserIds.length} selected users? This action cannot be undone.`}
      />
    </ProtectedRoute>
  );
};

export default UserManagement;

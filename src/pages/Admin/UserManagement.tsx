import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, Search, UserPlus, RotateCw } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Separator } from "@/components/ui/separator";
import { useDebounce } from "@/hooks/useDebounce";
import UserDialog from "./components/users/UserDialog";
import ConfirmDialog from "./components/users/ConfirmDialog";

interface User {
  id: string;
  email: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchUsers = async () => {
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

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearchTerm]);

  const handleOpenDialog = (user: User | null = null, editing = false) => {
    setSelectedUser(user);
    setIsEditing(editing);
    setIsDialogOpen(true);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleUserSave = async (userData: Partial<User>) => {
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
        // This would be for creating a new user, but Supabase handles this through auth signup
        // We don't need to implement this here as it's handled by the auth system
        toast.info("User creation should be done through the registration process");
      }
      
      setIsDialogOpen(false);
      fetchUsers();
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
      fetchUsers();
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
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" onClick={fetchUsers}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
        
        <Card>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex justify-center">
                        <RotateCw className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getFullName(user)}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleOpenDialog(user, true)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenDeleteDialog(user)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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
    </ProtectedRoute>
  );
};

export default UserManagement;


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
  full_name: string | null;
  username: string | null;
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
        .select("id, username, full_name, created_at");
      
      if (debouncedSearchTerm) {
        query = query.or(
          `username.ilike.%${debouncedSearchTerm}%,full_name.ilike.%${debouncedSearchTerm}%`
        );
      }
        
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Get email addresses from auth.users (this requires admin privileges)
      const userIds = (data || []).map((user) => user.id);
      
      if (userIds.length > 0) {
        const { data: authData, error: authError } = await supabase
          .rpc('admin_get_users', { user_ids: userIds });
        
        if (authError) throw authError;
        
        const emailMap = new Map();
        (authData || []).forEach((user: any) => {
          emailMap.set(user.id, user.email);
        });
        
        setUsers((data || []).map((user) => ({
          ...user,
          email: emailMap.get(user.id) || "No email found",
        })));
      } else {
        setUsers([]);
      }
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
            username: userData.username,
            full_name: userData.full_name
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
                  <TableHead>Username</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex justify-center">
                        <RotateCw className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.username || "-"}</TableCell>
                      <TableCell>{user.full_name || "-"}</TableCell>
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

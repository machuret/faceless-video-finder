
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Trash2, UserPlus, Mail, Check, X, AlertTriangle } from "lucide-react";
import { useUsersList } from "@/hooks/user/useUsersList";
import { useUserActions } from "@/hooks/user/useUserActions";
import { Pagination } from "./Pagination";
import { UserProfile } from "@/types/user";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

const UsersManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const { user } = useAuth();
  const { data, isLoading, error } = useUsersList(page, pageSize);
  const { toggleAdminStatus, deleteUser } = useUserActions();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleToggleAdmin = (userId: string, isCurrentlyAdmin: boolean) => {
    toggleAdminStatus.mutate({ userId, isAdmin: !isCurrentlyAdmin });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser.mutate(userId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <AlertTriangle className="h-5 w-5 inline mr-2" />
        <span>Error loading users: {error.toString()}</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Users Management</span>
          <Button variant="outline" className="flex items-center">
            <UserPlus className="h-4 w-4 mr-2" />
            <span>Invite User</span>
          </Button>
        </CardTitle>
        <CardDescription>
          Manage users, roles, and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead>Email Confirmed</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.users && data.users.length > 0 ? (
              data.users.map((userProfile: UserProfile) => (
                <TableRow key={userProfile.id}>
                  <TableCell>{userProfile.email}</TableCell>
                  <TableCell>{format(new Date(userProfile.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    {userProfile.last_sign_in_at 
                      ? format(new Date(userProfile.last_sign_in_at), 'MMM d, yyyy') 
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    {userProfile.email_confirmed 
                      ? <Check className="h-5 w-5 text-green-600" /> 
                      : <X className="h-5 w-5 text-red-600" />}
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={userProfile.is_admin} 
                      disabled={userProfile.id === user?.id || toggleAdminStatus.isPending}
                      onCheckedChange={() => handleToggleAdmin(userProfile.id, userProfile.is_admin)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={userProfile.id === user?.id}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this user? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteUser(userProfile.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {data && (
          <div className="mt-4">
            <Pagination 
              currentPage={page}
              totalPages={Math.ceil((data.totalCount || 0) / pageSize)}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsersManagement;

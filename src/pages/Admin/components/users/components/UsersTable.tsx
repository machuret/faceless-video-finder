
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, RotateCw } from "lucide-react";
import { User } from "../hooks/useUserForm";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  getFullName: (user: User) => string;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  selectedUsers: string[];
  onSelectUser: (userId: string, isSelected: boolean) => void;
  onSelectAllUsers: (isSelected: boolean) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  isLoading,
  getFullName,
  onEdit,
  onDelete,
  selectedUsers,
  onSelectUser,
  onSelectAllUsers
}) => {
  const allSelected = users.length > 0 && selectedUsers.length === users.length;
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAllUsers(!!checked)}
                disabled={users.length === 0 || isLoading}
              />
            </TableHead>
            <TableHead>Email</TableHead>
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
                <TableCell>
                  <Checkbox 
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => onSelectUser(user.id, !!checked)}
                  />
                </TableCell>
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
                      onClick={() => onEdit(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDelete(user)}
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
  );
};

export default UsersTable;

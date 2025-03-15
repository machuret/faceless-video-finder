
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useUserForm, User } from "./hooks/useUserForm";
import UserFormFields from "./components/UserFormFields";
import UserDialogFooter from "./components/UserDialogFooter";

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
  user: User | null;
  isEditing: boolean;
}

const UserDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  user, 
  isEditing 
}: UserDialogProps) => {
  const { form, isSubmitting, handleSubmit } = useUserForm({
    user,
    isEditing,
    isOpen,
    onSave
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the user's information" 
              : "Enter the details to create a new user"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <UserFormFields 
              form={form}
              isSubmitting={isSubmitting}
              isEditing={isEditing}
            />
            
            <UserDialogFooter
              isSubmitting={isSubmitting}
              isEditing={isEditing}
              onCancel={onClose}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;

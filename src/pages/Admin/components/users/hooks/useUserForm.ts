
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { createUserFormSchema, UserFormValues } from "../schema/userFormSchema";

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  banned_until: string | null;
}

interface UseUserFormProps {
  user: User | null;
  isEditing: boolean;
  isOpen: boolean;
  onSave: (userData: UserFormValues) => Promise<void>;
}

export const useUserForm = ({ user, isEditing, isOpen, onSave }: UseUserFormProps) => {
  const formSchema = createUserFormSchema(isEditing);
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      display_name: "",
      email: "",
      password: "",
    },
  });
  
  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = async (values: UserFormValues) => {
    await onSave(values);
    form.reset();
  };

  // Reset form when dialog opens with user data or closes
  useEffect(() => {
    if (isOpen && user) {
      form.reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        display_name: user.display_name || "",
        email: user.email || "",
        password: "",
      });
    } else if (isOpen && !user) {
      form.reset({
        first_name: "",
        last_name: "",
        display_name: "",
        email: "",
        password: "",
      });
    }
  }, [isOpen, user, form]);

  return {
    form,
    isSubmitting,
    handleSubmit
  };
};

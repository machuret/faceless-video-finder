
import * as z from "zod";

/**
 * Creates a form schema for user data based on whether we're editing or creating a user
 */
export const createUserFormSchema = (isEditing: boolean) => {
  return z.object({
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    display_name: z.string().min(2, "Display name must be at least 2 characters"),
    email: isEditing 
      ? z.string().optional() 
      : z.string().email("Invalid email address"),
    password: isEditing 
      ? z.string().optional() 
      : z.string().min(6, "Password must be at least 6 characters"),
  });
};

export type UserFormValues = z.infer<ReturnType<typeof createUserFormSchema>>;


import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define the form schema
export const registerFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const useRegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const addUserToSendFox = async (email: string, fullName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('add-to-sendfox', {
        body: { 
          email,
          first_name: fullName,
          list_id: 1191 // Your Faceless Finder list ID
        }
      });

      if (error) {
        console.error("Error adding user to SendFox:", error);
        // Don't show this error to the user as registration was successful
      } else {
        console.log("User added to SendFox successfully:", data);
      }
    } catch (error) {
      console.error("Exception adding user to SendFox:", error);
      // Don't show this error to the user as registration was successful
    }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      // Add user to SendFox list
      await addUserToSendFox(values.email, values.fullName);
      
      toast.success("Registration successful! Please check your email to confirm your account.");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    showPassword,
    showConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    onSubmit
  };
};

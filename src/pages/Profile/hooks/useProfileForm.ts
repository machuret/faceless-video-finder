
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// Define the form schema
export const profileFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const useProfileForm = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      username: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setIsFetching(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Use display_name or first_name + last_name for fullName
          const fullName = data.display_name || 
                           (data.first_name && data.last_name ? 
                           `${data.first_name} ${data.last_name}` : 
                           (data.first_name || ""));
                           
          form.setValue("fullName", fullName);
          // Use email for username since we don't have a username field
          form.setValue("username", data.email || "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchProfile();
  }, [user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: values.fullName,
          email: values.username,
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    isFetching,
    onSubmit
  };
};

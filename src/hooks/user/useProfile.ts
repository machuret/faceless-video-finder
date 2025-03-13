
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/auth/AuthContext";
import { UserProfile } from "@/context/auth/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useProfile = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (updatedProfile: Partial<UserProfile>) => {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      setLoading(true);
      
      try {
        // Update auth metadata if name is being updated
        if (updatedProfile.first_name || updatedProfile.last_name) {
          const { error: authError } = await supabase.auth.updateUser({
            data: {
              first_name: updatedProfile.first_name || profile?.first_name,
              last_name: updatedProfile.last_name || profile?.last_name,
            }
          });
          
          if (authError) {
            throw authError;
          }
        }
        
        // Add updated timestamp
        const profileWithTimestamp = {
          ...updatedProfile,
          updated_at: new Date().toISOString(),
        };
        
        // Update profile in database
        const { error } = await supabase
          .from('profiles')
          .update(profileWithTimestamp)
          .eq('id', user.id);
          
        if (error) {
          throw error;
        }
        
        return { success: true };
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      
      // Invalidate queries that may depend on profile data
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: any) => {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    }
  });
  
  // Update avatar mutation
  const updateAvatar = useMutation({
    mutationFn: async (file: File) => {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      setLoading(true);
      
      try {
        // Generate a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);
          
        const avatarUrl = data.publicUrl;
        
        // Update profile with new avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (updateError) {
          throw updateError;
        }
        
        return { success: true, avatarUrl };
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      toast.success("Avatar updated successfully");
      
      // Invalidate queries that may depend on profile data
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: any) => {
      console.error("Error updating avatar:", error);
      toast.error(error.message || "Failed to update avatar");
    }
  });
  
  return {
    updateProfile,
    updateAvatar,
    loading
  };
};

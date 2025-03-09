
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NicheInfo } from "./types";

export const useImageHandling = (
  formData: NicheInfo,
  setFormData: React.Dispatch<React.SetStateAction<NicheInfo>>,
  setUploading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    try {
      setUploading(true);
      toast.info("Uploading image...");

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `niche_${formData.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('niche-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('niche-images')
        .getPublicUrl(fileName);

      if (!publicUrlData?.publicUrl) {
        throw new Error("Failed to get public URL for image");
      }

      // Update form data with image URL
      setFormData(prev => ({
        ...prev,
        image_url: publicUrlData.publicUrl
      }));

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!formData.image_url) return;

    try {
      setUploading(true);
      
      // Extract file name from URL
      const fileName = formData.image_url.split('/').pop();
      
      if (fileName) {
        // Delete file from storage
        const { error } = await supabase.storage
          .from('niche-images')
          .remove([fileName]);
        
        if (error) {
          throw new Error(error.message);
        }
      }
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        image_url: null
      }));
      
      toast.success("Image removed successfully");
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error(`Failed to remove image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return {
    handleImageUpload,
    handleDeleteImage
  };
};

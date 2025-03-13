
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NicheInfo } from "./types";

export const useImageHandling = (formData: NicheInfo, setFormData: React.Dispatch<React.SetStateAction<NicheInfo>>) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Handle image upload
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      toast.info("Uploading image...");

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `niche_${formData.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('niche-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('niche-images')
        .getPublicUrl(fileName);

      // Update form data
      setFormData(prev => ({
        ...prev,
        image_url: data.publicUrl
      }));

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError(error instanceof Error ? error.message : 'Unknown error');
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }, [formData.name, setFormData]);

  // Handle image deletion
  const handleDeleteImage = useCallback(async () => {
    if (!formData.image_url) return;

    try {
      setUploading(true);
      
      // Extract file name from URL
      const fileName = formData.image_url.split('/').pop();
      
      if (fileName) {
        // Delete from storage
        const { error } = await supabase.storage
          .from('niche-images')
          .remove([fileName]);
        
        if (error) {
          throw error;
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
      toast.error("Failed to remove image");
    } finally {
      setUploading(false);
    }
  }, [formData.image_url, setFormData]);

  return {
    uploading,
    uploadError,
    handleImageUpload,
    handleDeleteImage
  };
};

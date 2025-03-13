
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NicheInfo } from "./types";

export const useImageHandling = (formData: NicheInfo, setFormData: (update: Partial<NicheInfo>) => void) => {
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

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
      const filePath = `niche-images/${fileName}`;

      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      if (urlData) {
        setFormData({ image_url: urlData.publicUrl });
        toast.success("Image uploaded successfully");
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setUploadError(error.message);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }, [formData.name, setFormData]);

  // Handle image deletion
  const handleDeleteImage = useCallback(async () => {
    if (!formData.image_url) return;

    try {
      setUploading(true);
      
      // Extract file path from URL
      const fileUrl = new URL(formData.image_url);
      const filePath = fileUrl.pathname.split('/').slice(2).join('/');

      // Delete from Storage
      const { error } = await supabase.storage
        .from('public')
        .remove([filePath]);

      if (error) {
        throw error;
      }

      setFormData({ image_url: null });
      toast.success("Image deleted successfully");
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast.error(`Delete failed: ${error.message}`);
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

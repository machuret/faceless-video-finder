
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NicheInfo } from "./types";

export const useImageHandling = (
  formData: NicheInfo,
  setFormData: React.Dispatch<React.SetStateAction<NicheInfo>>,
  setUploading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      console.log("Starting image upload to Supabase Storage");
      console.log("File name:", fileName);
      console.log("Bucket:", 'niche-images');

      // Upload file to Supabase Storage
      let { data: uploadData, error: uploadError } = await supabase.storage
        .from('niche-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        
        // If we get a permission error, try to create the bucket first
        if (uploadError.message.includes('permission') || uploadError.message.includes('policy')) {
          toast.info("Initializing storage buckets...");
          
          try {
            // Try to initialize storage buckets using our edge function
            const { error: initError } = await supabase.functions.invoke('initialize-storage');
            
            if (initError) {
              console.error("Error initializing storage:", initError);
              throw new Error(`Failed to initialize storage: ${initError.message}`);
            }
            
            // Try upload again after bucket initialization
            const { data: retryData, error: retryError } = await supabase.storage
              .from('niche-images')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
              });
              
            if (retryError) {
              console.error("Storage retry upload error:", retryError);
              throw new Error(retryError.message);
            }
            
            uploadData = retryData;
          } catch (initErr) {
            console.error("Storage initialization error:", initErr);
            throw new Error(`Storage initialization failed: ${initErr.message}`);
          }
        } else {
          throw new Error(uploadError.message);
        }
      }

      console.log("Image uploaded successfully", uploadData);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('niche-images')
        .getPublicUrl(fileName);

      if (!publicUrlData?.publicUrl) {
        throw new Error("Failed to get public URL for image");
      }

      console.log("Image public URL:", publicUrlData.publicUrl);

      // Update form data with image URL
      setFormData(prev => ({
        ...prev,
        image_url: publicUrlData.publicUrl
      }));

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError(error instanceof Error ? error.message : 'Unknown error');
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
        console.log("Deleting image:", fileName);
        
        // Delete file from storage
        const { error } = await supabase.storage
          .from('niche-images')
          .remove([fileName]);
        
        if (error) {
          console.error("Error removing image:", error);
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
    handleDeleteImage,
    uploadError
  };
};

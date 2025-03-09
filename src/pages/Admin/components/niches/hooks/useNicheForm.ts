
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface NicheInfo {
  name: string;
  description: string | null;
  example: string | null;
  image_url: string | null;
}

export const useNicheForm = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<NicheInfo>({
    name: "",
    description: null,
    example: null,
    image_url: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRichTextChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const setEditingNiche = (niche: string, description?: string | null, example?: string | null, image_url?: string | null) => {
    setFormData({
      name: niche,
      description: description || null,
      example: example || null,
      image_url: image_url || null
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setFormData({
      name: "",
      description: null,
      example: null,
      image_url: null
    });
    setIsEditing(false);
  };

  const saveNicheDetails = async () => {
    if (!formData.name.trim()) {
      toast.error("Niche name is required");
      return;
    }

    setSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke("update-niche-details", {
        body: { 
          niche: formData.name,
          description: formData.description || "",
          example: formData.example || "",
          image_url: formData.image_url || ""
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success(`Updated details for "${formData.name}"`);
      cancelEditing();
    } catch (error) {
      console.error("Error updating niche details:", error);
      toast.error("Failed to update niche details");
    } finally {
      setSubmitting(false);
    }
  };

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
    isEditing,
    formData,
    submitting,
    uploading,
    handleInputChange,
    handleRichTextChange,
    setEditingNiche,
    cancelEditing,
    saveNicheDetails,
    handleImageUpload,
    handleDeleteImage
  };
};


import React, { createContext, useContext, useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface NicheInfo {
  name: string;
  description: string | null;
  example: string | null;
  image_url: string | null;
  cpm: number | null;
}

interface NicheContextType {
  isEditing: boolean;
  formData: NicheInfo;
  submitting: boolean;
  uploading: boolean;
  nichesData: { niches: string[], nicheDetails: Record<string, any> } | null;
  isLoading: boolean;
  isDeleting: boolean;
  uploadError: string | null;
  
  // Actions
  setEditingNiche: (niche: string, description?: string | null, example?: string | null, image_url?: string | null, cpm?: number | null) => void;
  cancelEditing: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRichTextChange: (name: string, value: string) => void;
  saveNicheDetails: () => Promise<void>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDeleteImage: () => Promise<void>;
  handleDeleteNiche: (niche: string) => Promise<void>;
  refetchNiches: () => Promise<void>;
}

const NicheContext = createContext<NicheContextType | undefined>(undefined);

export const NicheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<NicheInfo>({
    name: "",
    description: null,
    example: null,
    image_url: null,
    cpm: 4
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [nichesData, setNichesData] = useState<{ niches: string[], nicheDetails: Record<string, any> } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch niches data
  const fetchNiches = useCallback(async () => {
    try {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase.functions.invoke("get-niches");
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data?.niches && Array.isArray(data.niches)) {
          setNichesData({
            niches: data.niches,
            nicheDetails: data.nicheDetails || {}
          });
          return;
        }
      } catch (edgeError) {
        console.warn("Edge function error, falling back to direct query:", edgeError);
      }
      
      // Fallback to direct query
      const { data, error } = await supabase
        .from('niches')
        .select('name, description, image_url, example, cpm')
        .order('name');
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const niches = data.map(niche => niche.name);
        const nicheDetails: Record<string, any> = {};
        
        data.forEach(niche => {
          nicheDetails[niche.name] = {
            name: niche.name,
            description: niche.description,
            example: niche.example,
            image_url: niche.image_url,
            cpm: niche.cpm
          };
        });
        
        setNichesData({ niches, nicheDetails });
      }
    } catch (error) {
      console.error("Error fetching niches:", error);
      toast.error("Failed to load niches");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetchNiches = useCallback(async () => {
    await fetchNiches();
  }, [fetchNiches]);

  // Initial fetch
  React.useEffect(() => {
    fetchNiches();
  }, [fetchNiches]);

  // Set editing state
  const setEditingNiche = useCallback((niche: string, description?: string | null, example?: string | null, image_url?: string | null, cpm?: number | null) => {
    setFormData({
      name: niche,
      description: description || null,
      example: example || null,
      image_url: image_url || null,
      cpm: cpm !== undefined ? cpm : 4
    });
    setIsEditing(true);
  }, []);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setFormData({
      name: "",
      description: null,
      example: null,
      image_url: null,
      cpm: 4
    });
    setIsEditing(false);
  }, []);

  // Handle form input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : null) : value
    }));
  }, []);

  // Handle rich text changes
  const handleRichTextChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Save niche details
  const saveNicheDetails = useCallback(async () => {
    if (!formData.name) return;
    
    try {
      setSubmitting(true);
      toast.info("Saving niche details...");
      
      // Check if niche already exists
      const { data: existingNiches, error: checkError } = await supabase
        .from('niches')
        .select('id')
        .eq('name', formData.name)
        .maybeSingle();
        
      if (checkError) {
        throw checkError;
      }
      
      let result;
      
      // Update or insert based on existence
      if (existingNiches) {
        // Update existing niche
        result = await supabase
          .from('niches')
          .update({
            description: formData.description,
            image_url: formData.image_url,
            example: formData.example,
            cpm: formData.cpm
          })
          .eq('name', formData.name);
      } else {
        // Insert new niche
        result = await supabase
          .from('niches')
          .insert({
            name: formData.name,
            description: formData.description,
            image_url: formData.image_url,
            example: formData.example,
            cpm: formData.cpm
          });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      // Refresh niches data
      await fetchNiches();
      toast.success("Niche details saved successfully");
      
      // Reset form
      cancelEditing();
    } catch (error) {
      console.error("Error saving niche details:", error);
      toast.error("Failed to save niche details");
    } finally {
      setSubmitting(false);
    }
  }, [formData, cancelEditing, fetchNiches]);

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
  }, [formData.name]);

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
  }, [formData.image_url]);

  // Handle niche deletion
  const handleDeleteNiche = useCallback(async (niche: string) => {
    if (!window.confirm(`Are you sure you want to delete "${niche}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setIsDeleting(true);
      toast.info(`Deleting niche: ${niche}...`);
      
      const { error } = await supabase
        .from('niches')
        .delete()
        .eq('name', niche);
        
      if (error) {
        throw error;
      }
      
      // Refresh niches data
      await fetchNiches();
      toast.success(`Niche "${niche}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting niche:", error);
      toast.error("Failed to delete niche");
    } finally {
      setIsDeleting(false);
    }
  }, [fetchNiches]);

  const value = {
    isEditing,
    formData,
    submitting,
    uploading,
    nichesData,
    isLoading,
    isDeleting,
    uploadError,
    setEditingNiche,
    cancelEditing,
    handleInputChange,
    handleRichTextChange,
    saveNicheDetails,
    handleImageUpload,
    handleDeleteImage,
    handleDeleteNiche,
    refetchNiches
  };

  return (
    <NicheContext.Provider value={value}>
      {children}
    </NicheContext.Provider>
  );
};

export const useNicheContext = () => {
  const context = useContext(NicheContext);
  if (context === undefined) {
    throw new Error("useNicheContext must be used within a NicheProvider");
  }
  return context;
};

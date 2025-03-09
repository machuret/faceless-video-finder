
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface NicheInfo {
  name: string;
  description: string | null;
  example: string | null;
}

export const useNicheForm = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<NicheInfo>({
    name: "",
    description: null,
    example: null
  });
  const [submitting, setSubmitting] = useState(false);

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

  const setEditingNiche = (niche: string, description?: string | null, example?: string | null) => {
    setFormData({
      name: niche,
      description: description || null,
      example: example || null
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setFormData({
      name: "",
      description: null,
      example: null
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
          example: formData.example || ""
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

  return {
    isEditing,
    formData,
    submitting,
    handleInputChange,
    handleRichTextChange,
    setEditingNiche,
    cancelEditing,
    saveNicheDetails
  };
};


import { useState, useCallback } from "react";
import { NicheInfo } from "./types";

export const useNicheFormState = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<NicheInfo>({
    name: "",
    description: null,
    example: null,
    image_url: null,
    cpm: 4
  });

  // Set editing state
  const setEditingNiche = useCallback((
    niche: string, 
    description?: string | null, 
    example?: string | null, 
    image_url?: string | null, 
    cpm?: number | null
  ) => {
    setFormData({
      name: niche,
      description: description || null,
      example: example || null,
      image_url: image_url || null,
      cpm: cpm !== null && cpm !== undefined ? cpm : 4
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
  
  // Expose the setFormData function for use by other hooks
  const updateFormData = useCallback((update: Partial<NicheInfo>) => {
    setFormData(prev => ({
      ...prev,
      ...update
    }));
  }, []);

  return {
    isEditing,
    formData,
    setEditingNiche,
    cancelEditing,
    handleInputChange,
    handleRichTextChange,
    updateFormData,
    setFormData
  };
};

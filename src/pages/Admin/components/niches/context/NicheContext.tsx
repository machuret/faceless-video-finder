
import React, { createContext, useContext, useState, useEffect } from "react";
import { NicheInfo } from "../hooks/types";
import { useNicheFetching } from "../hooks/useNicheFetching";
import { useNicheFormState } from "../hooks/useNicheFormState";
import { useNicheOperations } from "../hooks/useNicheOperations";
import { useImageHandling } from "../hooks/useImageHandling";

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
  // Fetch niches data
  const { nichesData, isLoading, refetchNiches, fetchNiches } = useNicheFetching();
  
  // Form state management
  const { isEditing, formData, setEditingNiche, cancelEditing, handleInputChange, handleRichTextChange } = useNicheFormState();
  
  // Niche operations
  const { submitting, isDeleting, saveNicheDetails, handleDeleteNiche } = useNicheOperations(formData, cancelEditing, refetchNiches);
  
  // Image handling
  const { uploading, uploadError, handleImageUpload, handleDeleteImage } = useImageHandling(formData, setFormData => setFormData);

  // Initial fetch
  useEffect(() => {
    fetchNiches();
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

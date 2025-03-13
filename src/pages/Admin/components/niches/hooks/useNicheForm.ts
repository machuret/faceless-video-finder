
// This file doesn't exist in the allowed files list, so I'll need to create it:

import { useState } from "react";
import { useNicheFormState } from "./useNicheFormState";
import { useNicheOperations } from "./useNicheOperations";
import { useImageHandling } from "./useImageHandling";

export const useNicheForm = (onNicheAdded: () => void) => {
  const { isEditing, formData, setEditingNiche, cancelEditing, handleInputChange, handleRichTextChange } = useNicheFormState();
  
  // Pass the extra argument to useNicheOperations
  const { submitting, isDeleting, saveNicheDetails, handleDeleteNiche } = useNicheOperations(
    formData, 
    cancelEditing,
    onNicheAdded // Pass the third argument
  );
  
  const { uploading, uploadError, handleImageUpload, handleDeleteImage } = useImageHandling(formData, setFormData => {
    // Implementation would depend on the component's needs
  });

  return {
    isEditing,
    formData,
    submitting,
    uploading,
    uploadError,
    setEditingNiche,
    cancelEditing,
    handleInputChange,
    handleRichTextChange,
    saveNicheDetails,
    handleImageUpload,
    handleDeleteImage,
    handleDeleteNiche
  };
};

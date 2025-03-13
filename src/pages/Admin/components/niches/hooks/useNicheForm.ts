
import { useState } from "react";
import { useNicheFormState } from "./useNicheFormState";
import { useNicheOperations } from "./useNicheOperations";
import { useImageHandling } from "./useImageHandling";

export const useNicheForm = (onNicheAdded: () => Promise<void> | void) => {
  const { 
    isEditing, 
    formData, 
    setEditingNiche, 
    cancelEditing, 
    handleInputChange, 
    handleRichTextChange,
    updateFormData 
  } = useNicheFormState();
  
  // Convert the callback to ensure it returns a Promise
  const wrappedCallback = async () => {
    const result = onNicheAdded();
    // If it's not a Promise, wrap it in a resolved Promise
    if (!(result instanceof Promise)) {
      return Promise.resolve();
    }
    return result;
  };
  
  // Pass the Promise-returning callback to useNicheOperations
  const { 
    submitting, 
    isDeleting, 
    saveNicheDetails, 
    handleDeleteNiche 
  } = useNicheOperations(
    formData, 
    cancelEditing,
    wrappedCallback
  );
  
  const { 
    uploading, 
    uploadError, 
    handleImageUpload, 
    handleDeleteImage 
  } = useImageHandling(formData, updateFormData);

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


import { useNicheFormState } from "./useNicheFormState";
import { useNicheOperations } from "./useNicheOperations";
import { useImageHandling } from "./useImageHandling";

export const useNicheForm = () => {
  // Get form state management
  const { 
    isEditing, 
    formData, 
    setEditingNiche, 
    cancelEditing, 
    handleInputChange, 
    handleRichTextChange,
    updateFormData
  } = useNicheFormState();
  
  // Get niche operations
  const { submitting, isDeleting, saveNicheDetails, handleDeleteNiche } = useNicheOperations(formData, cancelEditing);
  
  // Get image handling
  const { uploading, uploadError, handleImageUpload, handleDeleteImage } = useImageHandling(formData, updateFormData);

  return {
    // Form state
    isEditing,
    formData,
    submitting,
    uploading,
    isDeleting,
    uploadError,
    
    // Actions
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

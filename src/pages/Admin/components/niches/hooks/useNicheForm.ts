
import { useNicheFormState } from "./useNicheFormState";
import { useFormInputHandlers } from "./useFormInputHandlers";
import { useImageHandling } from "./useImageHandling";
import { useNicheSubmission } from "./useNicheSubmission";
import { NicheInfo } from "./types";

// Use export type for re-exporting types when isolatedModules is enabled
export type { NicheInfo };

export const useNicheForm = () => {
  const {
    isEditing,
    formData,
    submitting,
    uploading,
    setFormData,
    setSubmitting,
    setUploading,
    setEditingNiche,
    cancelEditing
  } = useNicheFormState();

  const { handleInputChange, handleRichTextChange } = useFormInputHandlers(setFormData);
  
  const { handleImageUpload, handleDeleteImage } = useImageHandling(
    formData,
    setFormData,
    setUploading
  );
  
  const { saveNicheDetails } = useNicheSubmission(
    formData,
    setSubmitting,
    cancelEditing
  );

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

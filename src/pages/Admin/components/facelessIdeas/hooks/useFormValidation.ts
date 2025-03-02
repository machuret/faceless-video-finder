
import { FacelessIdeaInfo, validateFacelessIdeaId } from "@/services/facelessIdeaService";
import { toast } from "sonner";

export const useFormValidation = () => {
  const validateForm = (formData: FacelessIdeaInfo, selectedIdea: FacelessIdeaInfo | null): boolean => {
    // Validate ID for new ideas
    if (!selectedIdea) {
      if (!validateFacelessIdeaId(formData.id)) {
        toast.error("ID must contain only lowercase letters, numbers, and underscores");
        return false;
      }
    }
    
    // Additional validation rules can be added here
    if (!formData.label) {
      toast.error("Label is required");
      return false;
    }
    
    return true;
  };
  
  return { validateForm };
};

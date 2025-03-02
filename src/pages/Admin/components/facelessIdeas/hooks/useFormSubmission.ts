
import { useState } from "react";
import { 
  FacelessIdeaInfo, 
  validateFacelessIdeaId 
} from "@/services/facelessIdeas";
import { toast } from "sonner";
import { useFormValidation } from "./useFormValidation";
import { useFormProcessing } from "./useFormProcessing";

export const useFormSubmission = (
  refreshFacelessIdeas: () => Promise<void>,
  setActiveTab: (tab: string) => void,
  setFormData: React.Dispatch<React.SetStateAction<FacelessIdeaInfo>>,
  setSelectedIdea: React.Dispatch<React.SetStateAction<FacelessIdeaInfo | null>>,
  initialFormState: FacelessIdeaInfo
) => {
  const [submitting, setSubmitting] = useState(false);
  
  const { validateForm } = useFormValidation();
  const { processFormSubmission } = useFormProcessing(refreshFacelessIdeas);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Directly get formData and selectedIdea from the form's handler
      const formData = (e.target as HTMLFormElement).formData as FacelessIdeaInfo;
      const selectedIdea = (e.target as HTMLFormElement).selectedIdea as FacelessIdeaInfo | null;
      
      console.log("Form submission data:", formData);
      console.log("Selected idea:", selectedIdea);
      
      // Validate form data before submission
      const isValid = validateForm(formData, selectedIdea);
      if (!isValid) {
        setSubmitting(false);
        return;
      }
      
      // Process the form submission (create or update)
      await processFormSubmission(formData, selectedIdea);
      
      // Reset form and redirect to list view
      setFormData(initialFormState);
      setSelectedIdea(null);
      setActiveTab("list");
    } catch (error) {
      console.error("Error submitting faceless idea:", error);
      toast.error(`Failed to submit faceless idea: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    setFormData(initialFormState);
    setSelectedIdea(null);
    setActiveTab("list");
  };
  
  return { submitting, handleSubmit, handleCancel };
};


import { useState, Dispatch, SetStateAction } from "react";
import { 
  FacelessIdeaInfo, 
  createFacelessIdea, 
  updateFacelessIdea,
  validateFacelessIdeaId 
} from "@/services/facelessIdeaService";
import { toast } from "sonner";

export const useFormSubmission = (
  refreshFacelessIdeas: () => Promise<void>,
  setActiveTab: (tab: string) => void,
  setFormData: Dispatch<SetStateAction<FacelessIdeaInfo>>,
  setSelectedIdea: Dispatch<SetStateAction<FacelessIdeaInfo | null>>,
  initialFormState: FacelessIdeaInfo
) => {
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (
    e: React.FormEvent,
    formData: FacelessIdeaInfo,
    selectedIdea: FacelessIdeaInfo | null
  ) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      console.log("Form submission data:", formData);
      console.log("Selected idea:", selectedIdea);
      
      // Determine if we're creating or updating based on if we have a selected idea
      if (!selectedIdea) {
        // Creating new faceless idea
        if (!validateFacelessIdeaId(formData.id)) {
          toast.error("ID must contain only lowercase letters, numbers, and underscores");
          setSubmitting(false);
          return;
        }
        
        console.log("Creating new faceless idea:", formData);
        const result = await createFacelessIdea(formData);
        console.log("Creation result:", result);
        
        toast.success(`Successfully created faceless idea: ${formData.label}`);
      } else {
        // Updating existing faceless idea
        console.log("Updating faceless idea:", formData);
        const result = await updateFacelessIdea(formData);
        console.log("Update result:", result);
        
        toast.success(`Successfully updated faceless idea: ${formData.label}`);
      }
      
      // Refresh the list of faceless ideas
      await refreshFacelessIdeas();
      
      // Reset form and redirect to list view
      setFormData(initialFormState);
      setSelectedIdea(null);
      setActiveTab("list");
    } catch (error) {
      console.error("Error submitting faceless idea:", error);
      toast.error(`Failed to ${selectedIdea ? "update" : "create"} faceless idea: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

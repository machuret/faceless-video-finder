
import { useState } from "react";
import { 
  FacelessIdeaInfo, 
  validateFacelessIdeaId,
  createFacelessIdea,
  updateFacelessIdea
} from "@/services/facelessIdeas";
import { toast } from "sonner";
import { useFormValidation } from "./useFormValidation";

export const useFormSubmission = (
  refreshFacelessIdeas: () => Promise<void>,
  setActiveTab: (tab: string) => void,
  setFormData: React.Dispatch<React.SetStateAction<FacelessIdeaInfo>>,
  setSelectedIdea: React.Dispatch<React.SetStateAction<FacelessIdeaInfo | null>>,
  initialFormState: FacelessIdeaInfo
) => {
  const [submitting, setSubmitting] = useState(false);
  
  const { validateForm } = useFormValidation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const form = e.target as HTMLFormElement;
      const formElements = form.elements as HTMLFormControlsCollection;
      
      // Get current form data
      const currentFormData = {
        id: (formElements.namedItem('id') as HTMLInputElement).value,
        label: (formElements.namedItem('label') as HTMLInputElement).value,
        description: document.getElementById('description')?.querySelector('.ProseMirror')?.innerHTML || '',
        production: document.getElementById('production')?.querySelector('.ProseMirror')?.innerHTML || '',
        example: document.getElementById('example')?.querySelector('.ProseMirror')?.innerHTML || ''
      } as FacelessIdeaInfo;
      
      // Validate form data
      if (!validateForm(currentFormData)) {
        setSubmitting(false);
        return;
      }
      
      // Determine if it's a create or update operation
      if (currentFormData.id && document.querySelector('[readonly]')) {
        // Update existing idea
        await updateFacelessIdea(currentFormData);
        toast.success("Faceless idea updated successfully");
      } else {
        // Create new idea
        await createFacelessIdea(currentFormData);
        toast.success("Faceless idea created successfully");
      }
      
      // Refresh data and reset form
      await refreshFacelessIdeas();
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

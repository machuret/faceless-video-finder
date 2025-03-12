
import { useState } from "react";
import { 
  FacelessIdeaInfo, 
  validateFacelessIdeaId,
  createFacelessIdea,
  updateFacelessIdea
} from "@/services/facelessIdeas";
import { toast } from "sonner";

type FormHandlerProps = {
  refreshFacelessIdeas: () => Promise<void>;
  setActiveTab: (tab: string) => void;
  initialFormState: FacelessIdeaInfo;
};

export const useFacelessIdeaForm = ({
  refreshFacelessIdeas,
  setActiveTab,
  initialFormState
}: FormHandlerProps) => {
  // Form state
  const [formData, setFormData] = useState<FacelessIdeaInfo>(initialFormState);
  const [selectedIdea, setSelectedIdea] = useState<FacelessIdeaInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Input handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRichTextChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Form validation
  const validateForm = (data: FacelessIdeaInfo, selected: FacelessIdeaInfo | null): boolean => {
    // Validate ID for new ideas
    if (!selected) {
      if (!data.id.trim()) {
        toast.error("ID is required");
        return false;
      }
      
      if (!validateFacelessIdeaId(data.id)) {
        toast.error("ID must contain only lowercase letters, numbers, and underscores");
        return false;
      }
    }
    
    // Additional validation rules
    if (!data.label.trim()) {
      toast.error("Label is required");
      return false;
    }
    
    return true;
  };
  
  // Form submission
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
        example: document.getElementById('example')?.querySelector('.ProseMirror')?.innerHTML || '',
        image_url: formData.image_url
      } as FacelessIdeaInfo;
      
      // Validate form data
      if (!validateForm(currentFormData, selectedIdea)) {
        setSubmitting(false);
        return;
      }
      
      // Determine if it's a create or update operation
      if (selectedIdea) {
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
  
  // Selection handlers
  const selectIdea = (idea: FacelessIdeaInfo) => {
    setSelectedIdea(idea);
    setFormData(idea);
    setActiveTab("edit");
  };
  
  const createNewIdea = () => {
    setSelectedIdea(null);
    setFormData(initialFormState);
    setActiveTab("edit");
  };
  
  return {
    formData,
    setFormData,
    selectedIdea,
    setSelectedIdea,
    submitting,
    handleInputChange,
    handleRichTextChange,
    validateForm,
    handleSubmit,
    handleCancel,
    selectIdea,
    createNewIdea
  };
};

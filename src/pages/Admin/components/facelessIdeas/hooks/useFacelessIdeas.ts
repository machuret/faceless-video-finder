
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  FacelessIdeaInfo, 
  fetchFacelessIdeas, 
  getFacelessIdeaById,
  processCsvImport
} from "@/services/facelessIdeaService";
import { useFacelessIdeaFormState } from "./useFacelessIdeaFormState";
import { useFormInputHandlers } from "./useFormInputHandlers";
import { useFormSubmission } from "./useFormSubmission";

export const useFacelessIdeas = () => {
  const [facelessIdeas, setFacelessIdeas] = useState<FacelessIdeaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list");

  // Initialize form state
  const initialFormState: FacelessIdeaInfo = {
    id: "",
    label: "",
    description: null,
    production: null,
    example: null
  };

  // Use the custom hooks for form state management
  const { formData, setFormData, selectedIdea, setSelectedIdea } = 
    useFacelessIdeaFormState(initialFormState);
    
  const { handleInputChange, handleRichTextChange } = 
    useFormInputHandlers<FacelessIdeaInfo>(setFormData);
    
  const handleSelectIdea = async (id: string) => {
    try {
      const idea = await getFacelessIdeaById(id);
      if (idea) {
        setSelectedIdea(idea);
        setFormData(idea);
        setActiveTab("edit");
      } else {
        toast.error("Faceless idea not found");
      }
    } catch (error) {
      console.error("Error selecting faceless idea:", error);
      toast.error("Error loading faceless idea details");
    }
  };
  
  const handleCreateNew = () => {
    setSelectedIdea(null);
    setFormData(initialFormState);
    setActiveTab("edit");
  };
  
  const loadFacelessIdeas = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await fetchFacelessIdeas();
      setFacelessIdeas(data);
    } catch (error) {
      console.error("Error loading faceless ideas:", error);
      toast.error("Error loading faceless ideas");
    } finally {
      setLoading(false);
    }
  };
  
  // Use the custom hook for form submission
  const { submitting, handleSubmit, handleCancel } = useFormSubmission(
    loadFacelessIdeas,
    setActiveTab,
    setFormData,
    setSelectedIdea,
    initialFormState
  );
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this faceless idea? This action cannot be undone.")) {
      try {
        const { deleteFacelessIdea } = await import("@/services/facelessIdeaService");
        await deleteFacelessIdea(id);
        
        // Update local state
        setFacelessIdeas(prev => prev.filter(idea => idea.id !== id));
        
        toast.success("Faceless idea deleted successfully");
      } catch (error) {
        console.error("Error deleting faceless idea:", error);
        toast.error("Error deleting faceless idea");
      }
    }
  };
  
  const handleCsvUpload = async (file: File) => {
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        if (!e.target?.result) return;
        
        const csvContent = e.target.result as string;
        const result = await processCsvImport(csvContent);
        
        if (result.success > 0) {
          toast.success(`Successfully imported ${result.success} faceless ideas`);
          loadFacelessIdeas();
        }
        
        if (result.failed > 0) {
          toast.error(`Failed to import ${result.failed} faceless ideas`);
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      toast.error("Error processing CSV file");
    }
  };
  
  // Initial load of faceless ideas
  useEffect(() => {
    loadFacelessIdeas();
  }, []);
  
  return {
    facelessIdeas,
    loading,
    activeTab,
    setActiveTab,
    submitting,
    selectedIdea,
    formData,
    handleInputChange,
    handleRichTextChange,
    handleSelectIdea,
    handleCreateNew,
    handleSubmit,
    handleDelete,
    handleCancel,
    handleCsvUpload
  };
};

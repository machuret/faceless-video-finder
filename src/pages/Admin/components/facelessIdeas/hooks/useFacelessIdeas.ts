
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FacelessIdeaInfo, fetchFacelessIdeas } from "@/services/facelessIdeaService";
import { useFacelessIdeaFormState } from "./useFacelessIdeaFormState";
import { useFormInputHandlers } from "./useFormInputHandlers";
import { useFormSubmission } from "./useFormSubmission";
import { useIdeaDeletion } from "./useIdeaDeletion";
import { useIdeaEnhancement } from "./useIdeaEnhancement";
import { useCsvImport } from "./useCsvImport";
import { useIdeaSelection } from "./useIdeaSelection";

export const useFacelessIdeas = () => {
  const [facelessIdeas, setFacelessIdeas] = useState<FacelessIdeaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list");

  const initialFormState: FacelessIdeaInfo = {
    id: "",
    label: "",
    description: null,
    production: null,
    example: null
  };

  const { formData, setFormData, selectedIdea, setSelectedIdea } = 
    useFacelessIdeaFormState(initialFormState);
    
  const { handleInputChange, handleRichTextChange } = 
    useFormInputHandlers<FacelessIdeaInfo>(setFormData);
    
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
  
  const { handleDelete, handleDeleteMultiple } = useIdeaDeletion(setFacelessIdeas, setLoading);
  
  const { handleEnhanceDescription, handleEnhanceMultiple } = useIdeaEnhancement(
    facelessIdeas, 
    setFacelessIdeas, 
    selectedIdea, 
    setFormData
  );
  
  const { handleCsvUpload } = useCsvImport(loadFacelessIdeas);
  
  const { handleSelectIdea, handleCreateNew } = useIdeaSelection(
    setSelectedIdea, 
    setFormData, 
    setActiveTab, 
    initialFormState
  );
  
  const { submitting, handleSubmit, handleCancel } = useFormSubmission(
    loadFacelessIdeas,
    setActiveTab,
    setFormData,
    setSelectedIdea,
    initialFormState
  );
  
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
    handleDeleteMultiple,
    handleCancel,
    handleCsvUpload,
    handleEnhanceDescription,
    handleEnhanceMultiple
  };
};

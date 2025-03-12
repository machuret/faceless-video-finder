
import { FacelessIdeaInfo } from "@/services/facelessIdeas";
import { useDataFetching } from "./useDataFetching";
import { useTabState } from "./useTabState";
import { useFacelessIdeaForm } from "./useFacelessIdeaForm";
import { useIdeaDeletion } from "./useIdeaDeletion";
import { useIdeaEnhancement } from "./useIdeaEnhancement";
import { useCsvImport } from "./useCsvImport";
import useIdeaSelection from "./useIdeaSelection";

export const useFacelessIdeas = () => {
  const initialFormState: FacelessIdeaInfo = {
    id: "",
    label: "",
    description: null,
    production: null,
    example: null,
    image_url: null
  };

  const { 
    facelessIdeas, 
    setFacelessIdeas, 
    loading, 
    setLoading, 
    loadFacelessIdeas 
  } = useDataFetching();
  
  const { activeTab, setActiveTab } = useTabState();
  
  const {
    formData,
    setFormData,
    selectedIdea,
    setSelectedIdea,
    submitting,
    handleInputChange,
    handleRichTextChange,
    handleSubmit,
    handleCancel,
    selectIdea,
    createNewIdea
  } = useFacelessIdeaForm({
    refreshFacelessIdeas: loadFacelessIdeas,
    setActiveTab,
    initialFormState
  });
  
  const { handleDelete, handleDeleteMultiple } = useIdeaDeletion(
    setFacelessIdeas, 
    setLoading
  );
  
  const { handleEnhanceDescription, handleEnhanceMultiple } = useIdeaEnhancement(
    facelessIdeas, 
    setFacelessIdeas, 
    selectedIdea, 
    setFormData
  );
  
  const { handleCsvUpload } = useCsvImport(loadFacelessIdeas);
  
  // Create utility functions to handle selection and new idea creation
  const handleSelectIdea = async (id: string) => {
    const selectedIdea = await useIdeaSelection().selectIdea(id);
    if (selectedIdea) {
      selectIdea(selectedIdea);
    }
  };
  
  const handleCreateNew = () => {
    useIdeaSelection().clearSelection();
    createNewIdea();
  };
  
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

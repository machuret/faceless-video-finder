
import { useCallback, useMemo } from "react";
import { FacelessIdeaInfo } from "@/services/facelessIdeas";
import { useDataFetching } from "./useDataFetching";
import { useTabState } from "./useTabState";
import { useFacelessIdeaForm } from "./useFacelessIdeaForm";
import { useIdeaDeletion } from "./useIdeaDeletion";
import { useIdeaEnhancement } from "./useIdeaEnhancement";
import { useCsvImport } from "./useCsvImport";
import useIdeaSelection from "./useIdeaSelection";

export const useFacelessIdeas = () => {
  // Memoize initial form state to prevent recreating on each render
  const initialFormState = useMemo(() => ({
    id: "",
    label: "",
    description: null,
    production: null,
    example: null,
    image_url: null
  }), []);

  // Data fetching hook
  const { 
    facelessIdeas, 
    setFacelessIdeas, 
    loading, 
    setLoading, 
    loadFacelessIdeas 
  } = useDataFetching();
  
  // Tab state hook
  const { activeTab, setActiveTab } = useTabState();
  
  // Form state and handlers
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
  
  // Deletion operations
  const { handleDelete, handleDeleteMultiple } = useIdeaDeletion(
    setFacelessIdeas, 
    setLoading
  );
  
  // Enhancement operations
  const { handleEnhanceDescription, handleEnhanceMultiple } = useIdeaEnhancement(
    facelessIdeas, 
    setFacelessIdeas, 
    selectedIdea, 
    setFormData
  );
  
  // CSV import
  const { handleCsvUpload } = useCsvImport(loadFacelessIdeas);
  
  // Memoize selection and creation handlers to prevent unnecessary recreations
  const handleSelectIdea = useCallback(async (id: string) => {
    const selectedIdea = await useIdeaSelection().selectIdea(id);
    if (selectedIdea) {
      selectIdea(selectedIdea);
    }
  }, [selectIdea]);
  
  const handleCreateNew = useCallback(() => {
    useIdeaSelection().clearSelection();
    createNewIdea();
  }, [createNewIdea]);
  
  // Return memoized API to prevent unnecessary re-renders in consuming components
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

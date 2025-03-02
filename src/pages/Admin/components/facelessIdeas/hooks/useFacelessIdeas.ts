
import { FacelessIdeaInfo } from "@/services/facelessIdeas";
import { useDataFetching } from "./useDataFetching";
import { useTabState } from "./useTabState";
import { useFacelessIdeaFormState } from "./useFacelessIdeaFormState";
import { useFormInputHandlers } from "./useFormInputHandlers";
import { useFormSubmission } from "./useFormSubmission";
import { useIdeaDeletion } from "./useIdeaDeletion";
import { useIdeaEnhancement } from "./useIdeaEnhancement";
import { useCsvImport } from "./useCsvImport";
import { useIdeaSelection } from "./useIdeaSelection";

export const useFacelessIdeas = () => {
  const initialFormState: FacelessIdeaInfo = {
    id: "",
    label: "",
    description: null,
    production: null,
    example: null
  };

  const { 
    facelessIdeas, 
    setFacelessIdeas, 
    loading, 
    setLoading, 
    loadFacelessIdeas 
  } = useDataFetching();
  
  const { activeTab, setActiveTab } = useTabState();
  
  const { formData, setFormData, selectedIdea, setSelectedIdea } = 
    useFacelessIdeaFormState(initialFormState);
    
  const { handleInputChange, handleRichTextChange } = 
    useFormInputHandlers<FacelessIdeaInfo>(setFormData);
  
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

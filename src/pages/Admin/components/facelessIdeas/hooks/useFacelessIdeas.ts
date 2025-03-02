
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
import { supabase } from "@/integrations/supabase/client";

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
        
        setFacelessIdeas(prev => prev.filter(idea => idea.id !== id));
        
        toast.success("Faceless idea deleted successfully");
      } catch (error) {
        console.error("Error deleting faceless idea:", error);
        toast.error("Error deleting faceless idea");
      }
    }
  };
  
  const handleDeleteMultiple = async (ids: string[]) => {
    try {
      setLoading(true);
      const { deleteFacelessIdea } = await import("@/services/facelessIdeaService");
      
      for (const id of ids) {
        await deleteFacelessIdea(id);
      }
      
      setFacelessIdeas(prev => prev.filter(idea => !ids.includes(idea.id)));
      
      toast.success(`Successfully deleted ${ids.length} faceless idea${ids.length === 1 ? '' : 's'}`);
    } catch (error) {
      console.error("Error deleting multiple faceless ideas:", error);
      toast.error("Error deleting faceless ideas");
    } finally {
      setLoading(false);
    }
  };
  
  const handleEnhanceDescription = async (ideaId: string) => {
    try {
      const idea = facelessIdeas.find(idea => idea.id === ideaId);
      if (!idea) {
        toast.error("Faceless idea not found");
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('enhance-faceless-idea', {
        body: { 
          label: idea.label,
          description: idea.description
        }
      });
      
      if (error) throw error;
      
      if (data?.enhancedDescription) {
        // Update the description in the database
        const { updateFacelessIdea } = await import("@/services/facelessIdeaService");
        const updatedIdea = { ...idea, description: data.enhancedDescription };
        await updateFacelessIdea(updatedIdea);
        
        // Update local state
        setFacelessIdeas(prev => prev.map(i => 
          i.id === ideaId ? { ...i, description: data.enhancedDescription } : i
        ));
        
        // If we're editing this idea, update the form data
        if (selectedIdea?.id === ideaId) {
          setFormData(prev => ({ ...prev, description: data.enhancedDescription }));
        }
        
        toast.success("Description enhanced successfully");
      } else {
        throw new Error("No enhanced description received");
      }
    } catch (error) {
      console.error("Error enhancing description:", error);
      toast.error("Error enhancing description: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };
  
  const handleCsvUpload = async (file: File) => {
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        if (!e.target?.result) return;
        
        const csvContent = e.target.result as string;
        console.log("CSV content first 100 chars:", csvContent.substring(0, 100));
        
        const lines = csvContent.split('\n').slice(0, 3);
        console.log("First 3 lines:");
        lines.forEach((line, i) => console.log(`Line ${i}:`, line));
        
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
    handleEnhanceDescription
  };
};

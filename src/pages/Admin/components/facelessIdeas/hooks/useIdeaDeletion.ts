import { useState } from "react";
import { toast } from "sonner";
import { FacelessIdeaInfo, deleteFacelessIdea } from "@/services/facelessIdeas";

export const useIdeaDeletion = (
  setFacelessIdeas: React.Dispatch<React.SetStateAction<FacelessIdeaInfo[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this faceless idea? This action cannot be undone.")) {
      try {
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

  return { handleDelete, handleDeleteMultiple };
};

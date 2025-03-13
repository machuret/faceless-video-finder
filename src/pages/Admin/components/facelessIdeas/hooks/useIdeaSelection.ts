
import { useState } from "react";
import { FacelessIdeaInfo } from "@/services/facelessIdeas/types";
import { fetchFacelessIdeaById } from "@/services/facelessIdeas";
import { toast } from "sonner";

const useIdeaSelection = () => {
  const [selectedIdea, setSelectedIdea] = useState<FacelessIdeaInfo | null>(null);
  const [loadingIdea, setLoadingIdea] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const selectIdea = async (id: string): Promise<FacelessIdeaInfo | null> => {
    setLoadingIdea(true);
    setError(null);
    
    try {
      if (retryCount > 0) {
        console.log(`Retrying fetch for idea ${id} (attempt ${retryCount + 1})`);
      }
      
      const idea = await fetchFacelessIdeaById(id);
      if (idea) {
        setSelectedIdea(idea);
        // Reset retry count on success
        if (retryCount > 0) setRetryCount(0);
        return idea;
      } else {
        const errorMsg = `Faceless idea with ID ${id} not found.`;
        setError(errorMsg);
        toast.error(errorMsg);
        setSelectedIdea(null);
        
        // Increment retry count
        setRetryCount(prev => prev + 1);
        
        return null;
      }
    } catch (e: any) {
      const errorMsg = `Failed to fetch faceless idea: ${e.message}`;
      setError(errorMsg);
      toast.error(errorMsg);
      setSelectedIdea(null);
      
      // Increment retry count
      setRetryCount(prev => prev + 1);
      
      // If we've tried multiple times, suggest a refresh
      if (retryCount >= 2) {
        toast.info("Try refreshing the page if the problem persists.");
      }
      
      return null;
    } finally {
      setLoadingIdea(false);
    }
  };

  const clearSelection = () => {
    setSelectedIdea(null);
    setError(null);
    setRetryCount(0);
  };

  return {
    selectedIdea,
    loadingIdea,
    error,
    retryCount,
    selectIdea,
    clearSelection,
  };
};

export default useIdeaSelection;


import { useState } from "react";
import { FacelessIdeaInfo } from "@/services/facelessIdeas/types";
import { fetchFacelessIdeaById } from "@/services/facelessIdeas";

const useIdeaSelection = () => {
  const [selectedIdea, setSelectedIdea] = useState<FacelessIdeaInfo | null>(null);
  const [loadingIdea, setLoadingIdea] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectIdea = async (id: string): Promise<FacelessIdeaInfo | null> => {
    setLoadingIdea(true);
    setError(null);
    try {
      const idea = await fetchFacelessIdeaById(id);
      if (idea) {
        setSelectedIdea(idea);
        return idea;
      } else {
        setError(`Faceless idea with ID ${id} not found.`);
        setSelectedIdea(null);
        return null;
      }
    } catch (e: any) {
      setError(`Failed to fetch faceless idea: ${e.message}`);
      setSelectedIdea(null);
      return null;
    } finally {
      setLoadingIdea(false);
    }
  };

  const clearSelection = () => {
    setSelectedIdea(null);
  };

  return {
    selectedIdea,
    loadingIdea,
    error,
    selectIdea,
    clearSelection,
  };
};

export default useIdeaSelection;

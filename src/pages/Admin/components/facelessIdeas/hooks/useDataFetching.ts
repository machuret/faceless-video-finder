
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FacelessIdeaInfo, fetchFacelessIdeas } from "@/services/facelessIdeas";

export const useDataFetching = () => {
  const [facelessIdeas, setFacelessIdeas] = useState<FacelessIdeaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const loadFacelessIdeas = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching faceless ideas...");
      const data = await fetchFacelessIdeas();
      console.log(`Fetched ${data.length} faceless ideas`);
      setFacelessIdeas(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error loading faceless ideas:", errorMessage);
      setError(errorMessage);
      toast.error(`Error loading faceless ideas: ${errorMessage}`);
      
      // Auto-retry once after a short delay if we haven't already
      if (retryCount < 1) {
        toast.info("Attempting to reload faceless ideas...");
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          loadFacelessIdeas();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadFacelessIdeas();
  }, []);
  
  return {
    facelessIdeas,
    setFacelessIdeas,
    loading,
    setLoading,
    error,
    loadFacelessIdeas
  };
};

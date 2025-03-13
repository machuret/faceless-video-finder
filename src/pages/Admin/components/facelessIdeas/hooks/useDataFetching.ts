
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
      
      // Improved fetch with retry mechanism
      const fetchWithRetry = async (attempts = 3): Promise<FacelessIdeaInfo[]> => {
        try {
          return await fetchFacelessIdeas();
        } catch (error) {
          if (attempts > 1) {
            console.log(`Retrying faceless ideas fetch. Attempts remaining: ${attempts - 1}`);
            await new Promise(r => setTimeout(r, 800)); // Wait 800ms before retrying
            return fetchWithRetry(attempts - 1);
          }
          throw error;
        }
      };
      
      const data = await fetchWithRetry();
      console.log(`Fetched ${data.length} faceless ideas`);
      setFacelessIdeas(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error loading faceless ideas:", errorMessage);
      setError(errorMessage);
      toast.error(`Error loading faceless ideas: ${errorMessage}`);
      
      // Auto-retry twice after a short delay if we haven't already
      if (retryCount < 2) {
        const nextRetry = retryCount + 1;
        setRetryCount(nextRetry);
        toast.info(`Attempting to reload faceless ideas... (Retry ${nextRetry}/2)`);
        setTimeout(() => {
          loadFacelessIdeas();
        }, 2000 * nextRetry); // Incremental backoff
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

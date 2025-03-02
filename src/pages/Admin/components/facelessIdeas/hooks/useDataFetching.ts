
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FacelessIdeaInfo, fetchFacelessIdeas } from "@/services/facelessIdeas";

export const useDataFetching = () => {
  const [facelessIdeas, setFacelessIdeas] = useState<FacelessIdeaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  
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
  
  useEffect(() => {
    loadFacelessIdeas();
  }, []);
  
  return {
    facelessIdeas,
    setFacelessIdeas,
    loading,
    setLoading,
    loadFacelessIdeas
  };
};


import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { niches as defaultNiches } from "@/data/niches";

export const useNicheFetching = () => {
  const [nichesData, setNichesData] = useState<{ niches: string[], nicheDetails: Record<string, any> } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch niches data from Supabase
  const fetchNiches = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try edge function first
      const { data, error } = await supabase.functions.invoke("get-niches");
      
      if (error) {
        console.error("Error from get-niches function:", error);
        throw new Error(error.message);
      }
      
      if (data?.niches && Array.isArray(data.niches) && data.niches.length > 0) {
        setNichesData(data);
        setIsLoading(false);
        return;
      }
      
      // Fallback to direct database query
      console.warn("Edge function returned empty niches array, trying direct DB query");
      
      const { data: nichesData, error: nichesError } = await supabase
        .from('niches')
        .select('name, description, example, image_url, cpm')
        .order('name');
        
      if (nichesError) {
        console.error("Error fetching niches from DB:", nichesError);
        throw new Error(nichesError.message);
      }
      
      if (nichesData && nichesData.length > 0) {
        const niches = nichesData.map(niche => niche.name);
        const nicheDetails: Record<string, any> = {};
        
        nichesData.forEach(niche => {
          if (niche && typeof niche === 'object') {
            const { name, description, example, image_url, cpm } = niche;
            nicheDetails[name as string] = {
              name,
              description,
              example,
              image_url,
              cpm: typeof cpm === 'number' ? cpm : 4
            };
          }
        });
        
        setNichesData({ niches, nicheDetails });
      } else {
        // Fallback to default niches if both approaches fail
        console.warn("No niches found in database, using default list");
        setNichesData({
          niches: defaultNiches,
          nicheDetails: {}
        });
      }
    } catch (error: any) {
      console.error("Error fetching niches:", error);
      toast.error("Failed to load niches. Using default list.");
      
      // Fallback to default niches on error
      setNichesData({
        niches: defaultNiches,
        nicheDetails: {}
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refetch niches
  const refetchNiches = useCallback(async () => {
    await fetchNiches();
  }, [fetchNiches]);

  return {
    nichesData,
    isLoading,
    fetchNiches,
    refetchNiches
  };
};

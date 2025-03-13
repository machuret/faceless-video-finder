
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { niches as defaultNiches } from "@/data/niches";
import { NicheInfo } from "./types";

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
        .select('name, description, image_url, cpm')
        .order('name');
        
      if (nichesError) {
        // Fix the error type check - use message property directly
        if (nichesError.message?.includes("column 'example' does not exist")) {
          // Try a simpler query without the missing columns
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('niches')
            .select('name, description, image_url, cpm')
            .order('name');
            
          if (fallbackError) {
            console.error("Error fetching niches with fallback query:", fallbackError);
            throw new Error(fallbackError.message || "Error with fallback query");
          }
          
          if (fallbackData && fallbackData.length > 0) {
            const niches = fallbackData.map(niche => niche.name as string);
            const nicheDetails: Record<string, any> = {};
            
            fallbackData.forEach(niche => {
              if (niche && typeof niche === 'object') {
                const { name, description, image_url, cpm } = niche as Partial<NicheInfo>;
                nicheDetails[name as string] = {
                  name,
                  description,
                  example: null,
                  image_url,
                  cpm: typeof cpm === 'number' ? cpm : 4
                };
              }
            });
            
            setNichesData({ niches, nicheDetails });
            setIsLoading(false);
            return;
          }
        } else {
          console.error("Error fetching niches from DB:", nichesError);
          throw new Error(nichesError.message || "Error fetching niches");
        }
      }
      
      if (nichesData && nichesData.length > 0) {
        const niches = nichesData.map(niche => niche.name as string);
        const nicheDetails: Record<string, any> = {};
        
        nichesData.forEach(niche => {
          if (niche && typeof niche === 'object') {
            const { name, description, image_url, cpm } = niche as NicheInfo;
            nicheDetails[name] = {
              name,
              description,
              example: null, // Remove example since it doesn't exist in the query
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

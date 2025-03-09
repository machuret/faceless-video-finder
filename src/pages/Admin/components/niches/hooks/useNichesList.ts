
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { niches as defaultNiches } from "@/data/niches";
import { toast } from "sonner";

interface NicheDetails {
  name: string;
  description: string | null;
  example: string | null;
  image_url: string | null;
}

export interface NichesData {
  niches: string[];
  nicheDetails: Record<string, NicheDetails>;
}

// Function to fetch niches data from Supabase
const fetchNiches = async (): Promise<NichesData> => {
  console.log("Fetching niches from Supabase...");
  try {
    const { data, error } = await supabase.functions.invoke("get-niches");
    
    if (error) {
      console.error("Error from get-niches function:", error);
      throw new Error(error.message);
    }
    
    console.log("Niches response:", data);
    
    if (data && data.niches && Array.isArray(data.niches) && data.niches.length > 0) {
      return {
        niches: data.niches,
        nicheDetails: data.nicheDetails || {}
      };
    }
    
    // Fallback to direct database query if the function returns empty array
    console.warn("Edge function returned empty niches array, trying direct DB query");
    
    const { data: nichesData, error: nichesError } = await supabase
      .from('niches')
      .select('id, name, description, image_url')
      .order('name');
      
    if (nichesError) {
      console.error("Error fetching niches from DB:", nichesError);
      throw new Error(nichesError.message);
    }
    
    if (nichesData && nichesData.length > 0) {
      const niches = nichesData.map(niche => niche.name);
      const nicheDetails = {};
      
      nichesData.forEach(niche => {
        nicheDetails[niche.name] = {
          name: niche.name,
          description: niche.description,
          example: null,
          image_url: niche.image_url
        };
      });
      
      return { niches, nicheDetails };
    }
    
    // Fallback to default niches if both approaches fail
    console.warn("No niches found in database, using default list");
    return {
      niches: defaultNiches,
      nicheDetails: {}
    };
  } catch (error) {
    // Log the error and fallback to default niches
    console.error("Error fetching niches:", error);
    toast.error("Failed to load niches. Using default list.");
    
    return {
      niches: defaultNiches,
      nicheDetails: {}
    };
  }
};

export const useNichesList = () => {
  return useQuery({
    queryKey: ['niches'],
    queryFn: fetchNiches,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
    retry: 2, // Retry twice
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30 * 1000), // Exponential backoff
  });
};

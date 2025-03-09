
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { niches as defaultNiches } from "@/data/niches";

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
  const { data, error } = await supabase.functions.invoke("get-niches");
  
  if (error) {
    console.error("Error from get-niches function:", error);
    throw new Error(error.message);
  }
  
  console.log("Niches response:", data);
  
  if (data && data.niches) {
    return {
      niches: data.niches,
      nicheDetails: data.nicheDetails || {}
    };
  }
  
  // Fallback to default niches if API fails
  console.warn("No niches found, using default list");
  return {
    niches: defaultNiches,
    nicheDetails: {}
  };
};

export const useNichesList = () => {
  return useQuery({
    queryKey: ['niches'],
    queryFn: fetchNiches,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
  });
};

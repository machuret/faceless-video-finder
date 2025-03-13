import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { niches as defaultNiches } from "@/data/niches";
import { toast } from "sonner";
import { getCache, setCache } from "@/utils/cacheUtils";
import { NicheInfo } from "../context/NicheContext";

export interface NichesData {
  niches: string[];
  nicheDetails: Record<string, NicheInfo>;
}

// Cache settings
const CACHE_KEY = 'niches_data';
const CACHE_VERSION = '1.0';
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

// Function to fetch niches data from Supabase with timeout protection and caching
const fetchNiches = async (): Promise<NichesData> => {
  console.log("Fetching niches data...");
  
  // Try to get from cache first
  const cachedData = getCache<NichesData>(CACHE_KEY, { version: CACHE_VERSION });
  if (cachedData) {
    console.log("Using cached niches data");
    return cachedData;
  }
  
  try {
    // Add timeout protection for the edge function call
    const edgeFunctionPromise = supabase.functions.invoke("get-niches");
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Edge function timeout")), 6000)
    );
    
    const { data, error } = await Promise.race([edgeFunctionPromise, timeoutPromise]) as any;
    
    if (error) {
      console.error("Error from get-niches function:", error);
      throw new Error(error.message);
    }
    
    console.log("Niches response:", data);
    
    if (data?.niches && Array.isArray(data.niches) && data.niches.length > 0) {
      const result = {
        niches: data.niches,
        nicheDetails: data.nicheDetails || {}
      };
      
      // Cache the successful response
      setCache(CACHE_KEY, result, { 
        expiry: CACHE_DURATION,
        version: CACHE_VERSION
      });
      
      return result;
    }
    
    // Fallback to direct database query with timeout protection
    console.warn("Edge function returned empty niches array, trying direct DB query");
    
    const dbQueryPromise = supabase
      .from('niches')
      .select('id, name, description, image_url, cpm')
      .order('name');
      
    const dbTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Database query timeout")), 5000)
    );
    
    const { data: nichesData, error: nichesError } = await Promise.race([dbQueryPromise, dbTimeoutPromise]) as any;
      
    if (nichesError) {
      console.error("Error fetching niches from DB:", nichesError);
      throw new Error(nichesError.message);
    }
    
    if (nichesData && nichesData.length > 0) {
      const niches = nichesData.map(niche => niche.name);
      const nicheDetails: Record<string, NicheInfo> = {};
      
      nichesData.forEach(niche => {
        nicheDetails[niche.name] = {
          name: niche.name,
          description: niche.description,
          example: null,
          image_url: niche.image_url,
          cpm: niche.cpm
        };
      });
      
      const result = { niches, nicheDetails };
      
      // Cache the successful database response
      setCache(CACHE_KEY, result, { 
        expiry: CACHE_DURATION,
        version: CACHE_VERSION
      });
      
      return result;
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
    staleTime: 12 * 60 * 60 * 1000, // 12 hours - niches change rarely
    gcTime: 24 * 60 * 60 * 1000,    // 24 hours - keep in cache longer
    refetchOnWindowFocus: false,
    retry: 2, // Retry twice
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30 * 1000), // Exponential backoff
  });
};

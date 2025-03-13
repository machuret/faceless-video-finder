
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getCache, setCache } from "@/utils/cacheUtils";
import { niches as defaultNiches } from "@/data/niches";

// Cache settings
const CACHE_KEY = 'niches_data';
const CACHE_VERSION = '1.0';
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

export interface NichesData {
  niches: string[];
  nicheDetails: Record<string, any>;
}

export const useNicheFetching = () => {
  const [nichesData, setNichesData] = useState<NichesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNiches = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Try to get from cache first
      const cachedData = getCache<NichesData>(CACHE_KEY, { version: CACHE_VERSION });
      if (cachedData) {
        console.log("Using cached niches data");
        setNichesData(cachedData);
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase.functions.invoke("get-niches");
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data?.niches && Array.isArray(data.niches)) {
          const result = {
            niches: data.niches,
            nicheDetails: data.nicheDetails || {}
          };
          
          setNichesData(result);
          
          // Cache the successful response
          setCache(CACHE_KEY, result, { 
            expiry: CACHE_DURATION,
            version: CACHE_VERSION
          });
          
          return;
        }
      } catch (edgeError) {
        console.warn("Edge function error, falling back to direct query:", edgeError);
      }
      
      // Fallback to direct query
      const { data, error } = await supabase
        .from('niches')
        .select('name, description, image_url, example, cpm')
        .order('name');
        
      if (error) {
        throw error;
      }
      
      if (data && Array.isArray(data)) {
        const niches = data.map(niche => niche.name);
        const nicheDetails: Record<string, any> = {};
        
        data.forEach(niche => {
          nicheDetails[niche.name] = {
            name: niche.name,
            description: niche.description,
            example: niche.example,
            image_url: niche.image_url,
            cpm: niche.cpm
          };
        });
        
        const result = { niches, nicheDetails };
        setNichesData(result);
        
        // Cache the successful database response
        setCache(CACHE_KEY, result, { 
          expiry: CACHE_DURATION,
          version: CACHE_VERSION
        });
      }
    } catch (error) {
      console.error("Error fetching niches:", error);
      toast.error("Failed to load niches");
      
      // Fallback to default niches
      setNichesData({
        niches: defaultNiches,
        nicheDetails: {}
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

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

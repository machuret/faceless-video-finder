
import { supabase } from "@/integrations/supabase/client";
import { FacelessIdeaInfo } from "./types";

// Fetch all faceless ideas with retry mechanism
export const fetchFacelessIdeas = async (): Promise<FacelessIdeaInfo[]> => {
  const maxRetries = 3;
  let retryCount = 0;
  let lastError = null;

  while (retryCount < maxRetries) {
    try {
      console.log(`Fetching faceless ideas from database (attempt ${retryCount + 1})...`);
      const { data, error } = await supabase
        .from("faceless_ideas")
        .select("*")
        .order("label");

      if (error) {
        console.error(`Supabase error fetching faceless ideas (attempt ${retryCount + 1}):`, error);
        lastError = error;
        retryCount++;
        // Add exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 8000)));
        continue;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} faceless ideas`);
      
      // Ensure all returned records have the required image_url property
      return (data || []).map(item => ({
        ...item,
        image_url: item.image_url || null
      })) as FacelessIdeaInfo[];
    } catch (error: any) {
      console.error(`Error fetching faceless ideas (attempt ${retryCount + 1}):`, error.message);
      lastError = error;
      retryCount++;
      // Add exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 8000)));
    }
  }

  // If we've exhausted retries, throw the last error
  console.error(`Failed to fetch faceless ideas after ${maxRetries} attempts`);
  throw lastError || new Error("Failed to fetch faceless ideas after multiple attempts");
};

// Fetch a single faceless idea by ID with retry
export const fetchFacelessIdeaById = async (id: string): Promise<FacelessIdeaInfo | null> => {
  const maxRetries = 3;
  let retryCount = 0;
  let lastError = null;

  while (retryCount < maxRetries) {
    try {
      console.log(`Fetching faceless idea with ID: ${id} (attempt ${retryCount + 1})`);
      
      // Try to fetch by id (which could be a UUID or a string ID)
      const { data, error } = await supabase
        .from("faceless_ideas")
        .select("*")
        .eq("id", id)
        .maybeSingle();  // Use maybeSingle instead of single to avoid errors when no row is found

      if (error) {
        // If we get an error that's not about "not found", log and retry
        console.error(`Error fetching faceless idea with ID ${id} (attempt ${retryCount + 1}):`, error.message);
        lastError = error;
        retryCount++;
        // Add exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 5000)));
        continue;
      }
      
      if (!data) {
        console.log(`No faceless idea found with ID ${id} after ${retryCount + 1} attempts`);
        return null;
      }
      
      // Ensure the returned record has the required image_url property
      return {
        ...data,
        image_url: data.image_url || null
      } as FacelessIdeaInfo;
    } catch (error: any) {
      console.error(`Error fetching faceless idea with ID ${id} (attempt ${retryCount + 1}):`, error.message);
      lastError = error;
      retryCount++;
      // Add exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retryCount), 5000)));
    }
  }

  // If we've exhausted retries, log and return null
  console.error(`Failed to fetch faceless idea with ID ${id} after ${maxRetries} attempts`);
  if (lastError) {
    throw lastError;
  }
  return null;
};

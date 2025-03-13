
import { supabase } from "@/integrations/supabase/client";
import { FacelessIdeaInfo } from "./types";
import { DEFAULT_FACELESS_IDEAS } from "./index";

// Fetch all faceless ideas with improved error handling
export const fetchFacelessIdeas = async (): Promise<FacelessIdeaInfo[]> => {
  try {
    console.log("Fetching faceless ideas from database...");
    
    // First try direct query with timeout protection
    const fetchPromise = supabase
      .from("faceless_ideas")
      .select("*")
      .order("label");
      
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database query timed out after 6 seconds")), 6000)
    );
    
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
    
    if (error) {
      console.error("Supabase error fetching faceless ideas:", error);
      throw error;
    }
    
    if (data && Array.isArray(data) && data.length > 0) {
      console.log(`Successfully fetched ${data.length} faceless ideas`);
      // Ensure all returned records have the required properties
      return data.map(item => ({
        id: item.id,
        label: item.label,
        description: item.description || null,
        image_url: item.image_url || null,
        production: item.production || null,
        example: item.example || null
      })) as FacelessIdeaInfo[];
    }
    
    // If no data, return default ideas
    console.warn("No faceless ideas found in database, using default list");
    return DEFAULT_FACELESS_IDEAS;
  } catch (error: any) {
    console.error("Error fetching faceless ideas:", error.message);
    // Return default ideas in case of error
    console.warn("Using default faceless ideas due to error");
    return DEFAULT_FACELESS_IDEAS;
  }
};

// Fetch a single faceless idea by ID with fallback
export const fetchFacelessIdeaById = async (id: string): Promise<FacelessIdeaInfo | null> => {
  try {
    console.log(`Fetching faceless idea with ID: ${id}`);
    
    // Try to fetch by id
    const { data, error } = await supabase
      .from("faceless_ideas")
      .select("*")
      .eq("id", id)
      .maybeSingle();  
      
    if (error) {
      console.error(`Error fetching faceless idea with ID ${id}:`, error.message);
    }
    
    if (data) {
      // Ensure the returned record has all required properties
      return {
        id: data.id,
        label: data.label,
        description: data.description || null,
        image_url: data.image_url || null,
        production: data.production || null,
        example: data.example || null
      } as FacelessIdeaInfo;
    }
    
    // If not found in database, check default ideas
    const defaultIdea = DEFAULT_FACELESS_IDEAS.find(idea => idea.id === id);
    if (defaultIdea) {
      return defaultIdea;
    }
    
    return null;
  } catch (error: any) {
    console.error(`Error fetching faceless idea with ID ${id}:`, error.message);
    
    // Check default ideas as fallback
    const defaultIdea = DEFAULT_FACELESS_IDEAS.find(idea => idea.id === id);
    if (defaultIdea) {
      return defaultIdea;
    }
    
    return null;
  }
};

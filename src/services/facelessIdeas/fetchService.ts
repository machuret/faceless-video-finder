
import { supabase } from "@/integrations/supabase/client";
import { FacelessIdeaInfo } from "./types";

// Fetch all faceless ideas
export const fetchFacelessIdeas = async (): Promise<FacelessIdeaInfo[]> => {
  try {
    const { data, error } = await supabase
      .from("faceless_ideas")
      .select("*")
      .order("label");

    if (error) throw error;
    
    // Ensure all returned records have the required image_url property
    return (data || []).map(item => ({
      ...item,
      image_url: item.image_url || null
    })) as FacelessIdeaInfo[];
  } catch (error: any) {
    console.error("Error fetching faceless ideas:", error.message);
    throw error;
  }
};

// Fetch a single faceless idea by ID
export const fetchFacelessIdeaById = async (id: string): Promise<FacelessIdeaInfo | null> => {
  try {
    console.log(`Fetching faceless idea with ID: ${id}`);
    
    // Try to fetch by id (which could be a UUID or a string ID)
    const { data, error } = await supabase
      .from("faceless_ideas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      // If we get an error and it's not a "not found" error, log and throw
      if (error.code !== 'PGRST116') {
        console.error(`Error fetching faceless idea with ID ${id}:`, error.message);
        throw error;
      }
      
      // If the idea wasn't found by UUID, it might be a string ID, so log this info
      console.log(`Faceless idea not found with ID ${id}, this might not be an error if using string IDs`);
      return null;
    }
    
    // Ensure the returned record has the required image_url property
    return data ? {
      ...data,
      image_url: data.image_url || null
    } as FacelessIdeaInfo : null;
  } catch (error: any) {
    console.error(`Error fetching faceless idea with ID ${id}:`, error.message);
    throw error;
  }
};

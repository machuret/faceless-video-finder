
import { supabase } from "@/integrations/supabase/client";
import { FacelessIdeaInfo } from "./types";

// Fetch all faceless ideas
export const fetchFacelessIdeas = async (): Promise<FacelessIdeaInfo[]> => {
  try {
    console.log("Fetching faceless ideas from database...");
    const { data, error } = await supabase
      .from("faceless_ideas")
      .select("*")
      .order("label");

    if (error) {
      console.error("Supabase error fetching faceless ideas:", error);
      throw error;
    }
    
    console.log(`Successfully fetched ${data?.length || 0} faceless ideas`);
    
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
      .maybeSingle();  // Use maybeSingle instead of single to avoid errors when no row is found

    if (error) {
      // If we get an error that's not about "not found", log and throw
      console.error(`Error fetching faceless idea with ID ${id}:`, error.message);
      throw error;
    }
    
    if (!data) {
      console.log(`No faceless idea found with ID ${id}`);
      return null;
    }
    
    // Ensure the returned record has the required image_url property
    return {
      ...data,
      image_url: data.image_url || null
    } as FacelessIdeaInfo;
  } catch (error: any) {
    console.error(`Error fetching faceless idea with ID ${id}:`, error.message);
    throw error;
  }
};

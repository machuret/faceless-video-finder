
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
    return data || [];
  } catch (error: any) {
    console.error("Error fetching faceless ideas:", error.message);
    throw error;
  }
};

// Fetch a single faceless idea by ID
export const fetchFacelessIdeaById = async (id: string): Promise<FacelessIdeaInfo | null> => {
  try {
    const { data, error } = await supabase
      .from("faceless_ideas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error(`Error fetching faceless idea with ID ${id}:`, error.message);
    throw error;
  }
};


import { supabase } from "@/integrations/supabase/client";
import { FacelessIdeaInfo, FacelessIdeaCreateInput, FacelessIdeaUpdateInput } from "./types";

// Create a new faceless idea
export const createFacelessIdea = async (idea: FacelessIdeaCreateInput): Promise<FacelessIdeaInfo> => {
  try {
    const { data, error } = await supabase
      .from("faceless_ideas")
      .insert(idea)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error creating faceless idea:", error.message);
    throw error;
  }
};

// Update an existing faceless idea
export const updateFacelessIdea = async (idea: FacelessIdeaUpdateInput): Promise<FacelessIdeaInfo> => {
  try {
    const { data, error } = await supabase
      .from("faceless_ideas")
      .update({
        label: idea.label,
        description: idea.description,
        production: idea.production,
        example: idea.example,
        updated_at: new Date().toISOString(),
      })
      .eq("id", idea.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error(`Error updating faceless idea with ID ${idea.id}:`, error.message);
    throw error;
  }
};

// Delete a faceless idea
export const deleteFacelessIdea = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("faceless_ideas")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error: any) {
    console.error(`Error deleting faceless idea with ID ${id}:`, error.message);
    throw error;
  }
};

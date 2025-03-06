
import { supabase } from "@/integrations/supabase/client";

export interface DidYouKnowFact {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const fetchAllFacts = async (): Promise<DidYouKnowFact[]> => {
  const { data, error } = await supabase
    .from("did_you_know_facts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching facts:", error);
    throw error;
  }

  return data || [];
};

export const fetchActiveFacts = async (): Promise<DidYouKnowFact[]> => {
  const { data, error } = await supabase
    .from("did_you_know_facts")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching active facts:", error);
    throw error;
  }

  return data || [];
};

export const fetchRandomFact = async (): Promise<DidYouKnowFact | null> => {
  try {
    console.log("Fetching random fact from did_you_know_facts table");
    
    // Get all active facts
    const { data, error } = await supabase
      .from("did_you_know_facts")
      .select("*")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching facts:", error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} active facts`);
    
    if (!data || data.length === 0) {
      console.log("No active facts found");
      return null;
    }

    // Select a random fact from the retrieved data
    const randomIndex = Math.floor(Math.random() * data.length);
    console.log(`Selected random fact index: ${randomIndex}`);
    return data[randomIndex];
  } catch (error) {
    console.error("Error in fetchRandomFact:", error);
    throw error;
  }
};

export const createFact = async (fact: Omit<DidYouKnowFact, "id" | "created_at" | "updated_at">): Promise<DidYouKnowFact> => {
  const { data, error } = await supabase
    .from("did_you_know_facts")
    .insert(fact)
    .select()
    .single();

  if (error) {
    console.error("Error creating fact:", error);
    throw error;
  }

  return data;
};

export const updateFact = async (id: string, updates: Partial<Omit<DidYouKnowFact, "id" | "created_at" | "updated_at">>): Promise<DidYouKnowFact> => {
  const { data, error } = await supabase
    .from("did_you_know_facts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating fact:", error);
    throw error;
  }

  return data;
};

export const deleteFact = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("did_you_know_facts")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting fact:", error);
    throw error;
  }
};

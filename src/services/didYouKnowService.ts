
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
  const { data, error } = await supabase
    .from("did_you_know_facts")
    .select("*")
    .eq("is_active", true)
    .order("RANDOM()")
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No facts found
      return null;
    }
    console.error("Error fetching random fact:", error);
    throw error;
  }

  return data;
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

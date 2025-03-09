
import { supabase } from "./client";

export const initializeStorage = async () => {
  try {
    console.log("Initializing storage buckets...");
    const { data, error } = await supabase.functions.invoke('initialize-storage');
    
    if (error) {
      console.error("Error initializing storage buckets:", error);
      return { success: false, error };
    }
    
    console.log("Storage buckets initialized:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Unexpected error initializing storage:", err);
    return { success: false, error: err };
  }
};

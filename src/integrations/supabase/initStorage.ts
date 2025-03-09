
import { supabase } from "./client";

export const initializeStorage = async () => {
  try {
    console.log("Initializing storage buckets...");
    
    // Try-catch to prevent app from crashing if the edge function fails
    try {
      const { data, error } = await supabase.functions.invoke('initialize-storage');
      
      if (error) {
        console.error("Error initializing storage buckets:", error);
        return { success: false, error };
      }
      
      console.log("Storage buckets initialized:", data);
      return { success: true, data };
    } catch (err) {
      // Log the error but don't crash the app
      console.error("Error invoking initialize-storage function:", err);
      // Return partial success to not block the app
      return { success: true, warning: "Storage initialization skipped due to error", error: err };
    }
  } catch (err) {
    console.error("Unexpected error initializing storage:", err);
    return { success: false, error: err };
  }
};

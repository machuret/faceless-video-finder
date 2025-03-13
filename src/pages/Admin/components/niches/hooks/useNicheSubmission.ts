
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NicheInfo } from "./types";

export const useNicheSubmission = (
  formData: NicheInfo,
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
  cancelEditing: () => void
) => {
  const saveNicheDetails = async () => {
    if (!formData.name.trim()) {
      toast.error("Niche name is required");
      return;
    }

    setSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke("update-niche-details", {
        body: { 
          niche: formData.name,
          description: formData.description || "",
          example: formData.example || "",
          image_url: formData.image_url || "",
          cpm: formData.cpm !== null && formData.cpm !== undefined ? formData.cpm : 4
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success(`Updated details for "${formData.name}"`);
      return true;
    } catch (error) {
      console.error("Error updating niche details:", error);
      toast.error("Failed to update niche details");
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    saveNicheDetails
  };
};

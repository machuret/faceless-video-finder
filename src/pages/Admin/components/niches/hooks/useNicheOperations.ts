
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NicheInfo } from "./types";

export const useNicheOperations = (
  formData: NicheInfo,
  cancelEditing: () => void,
  refetchNiches: () => Promise<void>
) => {
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Save niche details
  const saveNicheDetails = useCallback(async () => {
    if (!formData.name) return;
    
    try {
      setSubmitting(true);
      toast.info("Saving niche details...");
      
      // Check if niche already exists
      const { data: existingNiches, error: checkError } = await supabase
        .from('niches')
        .select('id')
        .eq('name', formData.name)
        .maybeSingle();
        
      if (checkError) {
        throw checkError;
      }
      
      let result;
      
      // Update or insert based on existence
      if (existingNiches) {
        // Update existing niche
        result = await supabase
          .from('niches')
          .update({
            description: formData.description,
            image_url: formData.image_url,
            example: formData.example,
            cpm: formData.cpm
          })
          .eq('name', formData.name);
      } else {
        // Insert new niche
        result = await supabase
          .from('niches')
          .insert({
            name: formData.name,
            description: formData.description,
            image_url: formData.image_url,
            example: formData.example,
            cpm: formData.cpm
          });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      // Refresh niches data
      await refetchNiches();
      toast.success("Niche details saved successfully");
      
      // Reset form
      cancelEditing();
    } catch (error) {
      console.error("Error saving niche details:", error);
      toast.error("Failed to save niche details");
    } finally {
      setSubmitting(false);
    }
  }, [formData, cancelEditing, refetchNiches]);

  // Handle niche deletion
  const handleDeleteNiche = useCallback(async (niche: string) => {
    if (!window.confirm(`Are you sure you want to delete "${niche}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setIsDeleting(true);
      toast.info(`Deleting niche: ${niche}...`);
      
      const { error } = await supabase
        .from('niches')
        .delete()
        .eq('name', niche);
        
      if (error) {
        throw error;
      }
      
      // Refresh niches data
      await refetchNiches();
      toast.success(`Niche "${niche}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting niche:", error);
      toast.error("Failed to delete niche");
    } finally {
      setIsDeleting(false);
    }
  }, [refetchNiches]);

  return {
    submitting,
    isDeleting,
    saveNicheDetails,
    handleDeleteNiche
  };
};

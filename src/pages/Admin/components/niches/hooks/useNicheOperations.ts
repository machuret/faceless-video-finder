
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useNicheOperations = (refetch: () => Promise<unknown>) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteNiche = async (niche: string) => {
    if (!confirm(`Are you sure you want to delete "${niche}"?`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase.functions.invoke("delete-niche", {
        body: { niche }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Refresh the niches list
      await refetch();
      toast.success(`Deleted "${niche}" from niches`);
    } catch (error) {
      console.error("Error deleting niche:", error);
      toast.error("Failed to delete niche");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    handleDeleteNiche
  };
};

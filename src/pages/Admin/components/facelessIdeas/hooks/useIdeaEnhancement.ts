
import { toast } from "sonner";
import { FacelessIdeaInfo } from "@/services/facelessIdeaService";
import { supabase } from "@/integrations/supabase/client";

export const useIdeaEnhancement = (
  facelessIdeas: FacelessIdeaInfo[],
  setFacelessIdeas: React.Dispatch<React.SetStateAction<FacelessIdeaInfo[]>>,
  selectedIdea: FacelessIdeaInfo | null,
  setFormData: React.Dispatch<React.SetStateAction<FacelessIdeaInfo>>
) => {
  const handleEnhanceDescription = async (ideaId: string) => {
    try {
      const idea = facelessIdeas.find(idea => idea.id === ideaId);
      if (!idea) {
        toast.error("Faceless idea not found");
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('enhance-faceless-idea', {
        body: { 
          label: idea.label,
          description: idea.description
        }
      });
      
      if (error) throw error;
      
      if (data?.enhancedDescription) {
        // Update the description in the database
        const { updateFacelessIdea } = await import("@/services/facelessIdeaService");
        const updatedIdea = { ...idea, description: data.enhancedDescription };
        await updateFacelessIdea(updatedIdea);
        
        // Update local state
        setFacelessIdeas(prev => prev.map(i => 
          i.id === ideaId ? { ...i, description: data.enhancedDescription } : i
        ));
        
        // If we're editing this idea, update the form data
        if (selectedIdea?.id === ideaId) {
          setFormData(prev => ({ ...prev, description: data.enhancedDescription }));
        }
        
        toast.success("Description enhanced successfully");
      } else {
        throw new Error("No enhanced description received");
      }
    } catch (error) {
      console.error("Error enhancing description:", error);
      toast.error("Error enhancing description: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  return { handleEnhanceDescription };
};

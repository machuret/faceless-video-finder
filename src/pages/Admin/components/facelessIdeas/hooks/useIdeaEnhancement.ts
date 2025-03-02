
import { toast } from "sonner";
import { FacelessIdeaInfo, updateFacelessIdea } from "@/services/facelessIdeaService";
import { supabase } from "@/integrations/supabase/client";

export const useIdeaEnhancement = (
  facelessIdeas: FacelessIdeaInfo[],
  setFacelessIdeas: React.Dispatch<React.SetStateAction<FacelessIdeaInfo[]>>,
  selectedIdea: FacelessIdeaInfo | null,
  setFormData: React.Dispatch<React.SetStateAction<FacelessIdeaInfo>>
) => {
  const cleanDescription = (description: string): string => {
    // Remove ```html and ``` tags that might be in the response
    let cleanedDescription = description;
    cleanedDescription = cleanedDescription.replace(/```html/g, "");
    cleanedDescription = cleanedDescription.replace(/```/g, "");
    
    return cleanedDescription;
  };

  const handleEnhanceDescription = async (ideaId: string) => {
    try {
      const idea = facelessIdeas.find(idea => idea.id === ideaId);
      if (!idea) {
        toast.error("Faceless idea not found");
        return;
      }
      
      toast.info("Enhancing description...", { duration: 2000 });
      
      console.log("Calling enhance-faceless-idea function with:", { 
        label: idea.label, 
        description: idea.description 
      });
      
      const { data, error } = await supabase.functions.invoke('enhance-faceless-idea', {
        body: { 
          label: idea.label,
          description: idea.description
        }
      });
      
      console.log("Response from enhance-faceless-idea:", { data, error });
      
      if (error) {
        console.error("Edge Function error:", error);
        throw error;
      }
      
      if (data?.enhancedDescription) {
        // Clean the description from markdown/HTML code blocks
        let cleanedDescription = cleanDescription(data.enhancedDescription);
        
        // Update the description in the database
        const updatedIdea = { ...idea, description: cleanedDescription };
        await updateFacelessIdea(updatedIdea);
        
        // Update local state
        setFacelessIdeas(prev => prev.map(i => 
          i.id === ideaId ? { ...i, description: cleanedDescription } : i
        ));
        
        // If we're editing this idea, update the form data
        if (selectedIdea?.id === ideaId) {
          setFormData(prev => ({ ...prev, description: cleanedDescription }));
        }
        
        toast.success("Description enhanced successfully");
      } else {
        throw new Error("No enhanced description received");
      }
    } catch (error) {
      console.error("Error enhancing description:", error);
      toast.error("Error enhancing description: " + (error instanceof Error ? error.message : "Unknown error"));
      throw error; // Re-throw to allow caller to handle it
    }
  };

  const handleEnhanceMultiple = async (ideaIds: string[]) => {
    if (ideaIds.length === 0) {
      toast.error("No ideas selected for enhancement");
      return;
    }

    toast.info(`Enhancing ${ideaIds.length} descriptions... This may take a while.`, { duration: 5000 });
    
    let successCount = 0;
    let failCount = 0;
    
    // Using Promise.all would make all requests at once which might be too much
    // Instead, we process them sequentially to avoid rate limiting
    for (const ideaId of ideaIds) {
      try {
        await handleEnhanceDescription(ideaId);
        successCount++;
        // Update progress toast
        if (ideaIds.length > 1) {
          toast.info(`Progress: ${successCount + failCount}/${ideaIds.length} processed`, { 
            id: 'enhancement-progress',
            duration: 2000 
          });
        }
      } catch (error) {
        console.error(`Error enhancing idea ${ideaId}:`, error);
        failCount++;
      }
    }
    
    if (successCount > 0) {
      toast.success(`Successfully enhanced ${successCount} descriptions`);
    }
    
    if (failCount > 0) {
      toast.error(`Failed to enhance ${failCount} descriptions`);
    }
  };

  return { handleEnhanceDescription, handleEnhanceMultiple };
};

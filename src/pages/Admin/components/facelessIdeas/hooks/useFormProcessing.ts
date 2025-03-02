
import { FacelessIdeaInfo, createFacelessIdea, updateFacelessIdea } from "@/services/facelessIdeaService";
import { toast } from "sonner";

export const useFormProcessing = (
  refreshFacelessIdeas: () => Promise<void>
) => {
  const processFormSubmission = async (
    formData: FacelessIdeaInfo,
    selectedIdea: FacelessIdeaInfo | null
  ): Promise<void> => {
    // Determine if we're creating or updating based on if we have a selected idea
    if (!selectedIdea) {
      // Creating new faceless idea
      console.log("Creating new faceless idea:", formData);
      const result = await createFacelessIdea(formData);
      console.log("Creation result:", result);
      
      toast.success(`Successfully created faceless idea: ${formData.label}`);
    } else {
      // Updating existing faceless idea
      console.log("Updating faceless idea:", formData);
      const result = await updateFacelessIdea(formData);
      console.log("Update result:", result);
      
      toast.success(`Successfully updated faceless idea: ${formData.label}`);
    }
    
    // Refresh the list of faceless ideas
    await refreshFacelessIdeas();
  };
  
  return { processFormSubmission };
};

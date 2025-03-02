
import { FacelessIdeaInfo, createFacelessIdea, updateFacelessIdea } from "@/services/facelessIdeaService";
import { toast } from "sonner";

export const useFormProcessing = (
  refreshFacelessIdeas: () => Promise<void>
) => {
  const processFormSubmission = async (
    formData: FacelessIdeaInfo,
    selectedIdea: FacelessIdeaInfo | null
  ): Promise<void> => {
    try {
      // Ensure data is properly formatted
      const processedFormData = {
        ...formData,
        id: formData.id.trim(),
        label: formData.label.trim(),
        description: formData.description || null,
        production: formData.production || null,
        example: formData.example || null
      };
      
      // Determine if we're creating or updating based on if we have a selected idea
      if (!selectedIdea) {
        // Creating new faceless idea
        console.log("Creating new faceless idea:", processedFormData);
        const result = await createFacelessIdea(processedFormData);
        console.log("Creation result:", result);
        
        toast.success(`Successfully created faceless idea: ${processedFormData.label}`);
      } else {
        // Updating existing faceless idea
        console.log("Updating faceless idea:", processedFormData);
        const result = await updateFacelessIdea(processedFormData);
        console.log("Update result:", result);
        
        toast.success(`Successfully updated faceless idea: ${processedFormData.label}`);
      }
      
      // Refresh the list of faceless ideas
      await refreshFacelessIdeas();
    } catch (error) {
      console.error("Error processing form submission:", error);
      toast.error("Error: " + (error instanceof Error ? error.message : "Unknown error occurred"));
      throw error; // Re-throw to allow the calling code to handle it
    }
  };
  
  return { processFormSubmission };
};

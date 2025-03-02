
import { toast } from "sonner";
import { FacelessIdeaInfo, getFacelessIdeaById } from "@/services/facelessIdeas";

export const useIdeaSelection = (
  setSelectedIdea: React.Dispatch<React.SetStateAction<FacelessIdeaInfo | null>>,
  setFormData: React.Dispatch<React.SetStateAction<FacelessIdeaInfo>>,
  setActiveTab: (tab: string) => void,
  initialFormState: FacelessIdeaInfo
) => {
  const handleSelectIdea = async (id: string) => {
    try {
      const idea = await getFacelessIdeaById(id);
      if (idea) {
        setSelectedIdea(idea);
        setFormData(idea);
        setActiveTab("edit");
      } else {
        toast.error("Faceless idea not found");
      }
    } catch (error) {
      console.error("Error selecting faceless idea:", error);
      toast.error("Error loading faceless idea details");
    }
  };
  
  const handleCreateNew = () => {
    setSelectedIdea(null);
    setFormData(initialFormState);
    setActiveTab("edit");
  };

  return { handleSelectIdea, handleCreateNew };
};

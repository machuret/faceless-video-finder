
import { useState } from "react";
import { toast } from "sonner";
import { 
  fetchAllFacts, 
  createFact, 
  updateFact,
  DidYouKnowFact 
} from "@/services/didYouKnowService";

export const useFactsOperations = () => {
  const [facts, setFacts] = useState<DidYouKnowFact[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFacts = async () => {
    try {
      setLoading(true);
      const data = await fetchAllFacts();
      setFacts(data);
    } catch (error) {
      toast.error("Failed to load facts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (factData: Partial<DidYouKnowFact>, isEditing: boolean) => {
    try {
      if (!factData.title || !factData.content) {
        toast.error("Title and content are required");
        return;
      }

      if (isEditing && factData.id) {
        await updateFact(factData.id, {
          title: factData.title,
          content: factData.content,
          is_active: factData.is_active
        });
        toast.success("Fact updated successfully");
      } else {
        await createFact({
          title: factData.title,
          content: factData.content,
          is_active: factData.is_active || true
        });
        toast.success("Fact created successfully");
      }
      
      return true;
    } catch (error) {
      toast.error(isEditing ? "Failed to update fact" : "Failed to create fact");
      console.error(error);
      return false;
    }
  };

  return {
    facts,
    loading,
    loadFacts,
    handleSubmit
  };
};


import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  fetchAllFacts, 
  createFact, 
  updateFact, 
  DidYouKnowFact 
} from "@/services/didYouKnowService";

export const useFactsManagement = () => {
  const [facts, setFacts] = useState<DidYouKnowFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFact, setCurrentFact] = useState<Partial<DidYouKnowFact>>({
    title: "",
    content: "",
    is_active: true
  });

  useEffect(() => {
    loadFacts();
  }, []);

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

  const handleOpenDialog = (fact?: DidYouKnowFact) => {
    if (fact) {
      setCurrentFact(fact);
      setIsEditing(true);
    } else {
      setCurrentFact({
        title: "",
        content: "",
        is_active: true
      });
      setIsEditing(false);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (factData: Partial<DidYouKnowFact>) => {
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
      
      setDialogOpen(false);
      loadFacts();
    } catch (error) {
      toast.error(isEditing ? "Failed to update fact" : "Failed to create fact");
      console.error(error);
    }
  };

  return {
    facts,
    loading,
    dialogOpen,
    isEditing,
    currentFact,
    setDialogOpen,
    handleOpenDialog,
    handleSubmit,
    loadFacts
  };
};

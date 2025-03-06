
import { useState } from "react";
import { DidYouKnowFact } from "@/services/didYouKnowService";

export const useFactsDialog = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFact, setCurrentFact] = useState<Partial<DidYouKnowFact>>({
    title: "",
    content: "",
    is_active: true
  });

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

  return {
    dialogOpen,
    isEditing,
    currentFact,
    setDialogOpen,
    handleOpenDialog
  };
};


import { useState } from "react";
import { FacelessIdeaInfo } from "@/services/facelessIdeaService";

export const useFacelessIdeaFormState = (initialState: FacelessIdeaInfo) => {
  const [formData, setFormData] = useState<FacelessIdeaInfo>(initialState);
  const [selectedIdea, setSelectedIdea] = useState<FacelessIdeaInfo | null>(null);
  
  return {
    formData,
    setFormData,
    selectedIdea,
    setSelectedIdea
  };
};

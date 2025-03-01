
import { Dispatch, SetStateAction } from "react";
import { ChannelTypeInfo, getChannelTypeById } from "@/services/channelTypeService";

export const useTypeSelection = (
  // Update the type here to match useChannelTypeFormState
  setSelectedType: Dispatch<SetStateAction<ChannelTypeInfo | null>>,
  setFormData: Dispatch<SetStateAction<ChannelTypeInfo>>,
  setActiveTab: (tab: string) => void
) => {
  const handleSelectType = async (id: string) => {
    try {
      const typeInfo = await getChannelTypeById(id);
      
      if (typeInfo) {
        // Pass the full typeInfo object instead of just the ID
        setSelectedType(typeInfo);
        setFormData(typeInfo);
        setActiveTab("edit");
      } else {
        console.error(`Channel type with ID ${id} not found`);
      }
    } catch (error) {
      console.error("Error fetching channel type:", error);
    }
  };

  const handleCreateNew = () => {
    setSelectedType(null);
    setFormData({
      id: "",
      label: "",
      description: "",
      production: "",
      example: ""
    });
    setActiveTab("edit");
  };

  return { handleSelectType, handleCreateNew };
};

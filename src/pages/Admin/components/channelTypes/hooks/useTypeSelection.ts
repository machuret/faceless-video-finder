
import { Dispatch, SetStateAction } from "react";
import { ChannelTypeInfo, getChannelTypeById } from "@/services/channelTypeService";

export const useTypeSelection = (
  setSelectedType: Dispatch<SetStateAction<ChannelTypeInfo | null>>,
  setFormData: Dispatch<SetStateAction<ChannelTypeInfo>>,
  setActiveTab: (tab: string) => void
) => {
  const handleSelectType = async (id: string) => {
    try {
      console.log("Fetching channel type data for ID:", id);
      const typeInfo = await getChannelTypeById(id);
      
      if (typeInfo) {
        console.log("Channel type data received:", typeInfo);
        setSelectedType(typeInfo);
        
        // Make sure we're setting the complete object with all properties
        setFormData({
          id: typeInfo.id,
          label: typeInfo.label,
          description: typeInfo.description || '',
          production: typeInfo.production || '',
          example: typeInfo.example || ''
        });
        
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


import { Dispatch, SetStateAction } from "react";
import { ChannelTypeInfo } from "@/services/channelTypeService";
import { getChannelTypeById } from "@/services/channelTypeService";

export const useTypeSelection = (
  setSelectedType: Dispatch<SetStateAction<string | null>>,
  setFormData: Dispatch<SetStateAction<ChannelTypeInfo>>,
  setActiveTab: (tab: string) => void
) => {
  const handleSelectType = async (id: string) => {
    try {
      const typeInfo = await getChannelTypeById(id);
      
      if (typeInfo) {
        setSelectedType(id);
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

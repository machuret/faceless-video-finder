
import { useState } from "react";
import { ChannelTypeInfo } from "@/services/channelTypeService";

export const useChannelTypeFormState = (initialState: ChannelTypeInfo) => {
  const [formData, setFormData] = useState<ChannelTypeInfo>(initialState);
  const [selectedType, setSelectedType] = useState<ChannelTypeInfo | null>(null);

  return {
    formData,
    setFormData,
    selectedType,
    setSelectedType
  };
};

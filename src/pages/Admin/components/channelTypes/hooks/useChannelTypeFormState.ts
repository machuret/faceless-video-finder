
import { useState } from "react";
import { ChannelTypeInfo } from "@/services/channelTypeService";

export const useChannelTypeFormState = (initialState: ChannelTypeInfo) => {
  const [formData, setFormData] = useState<ChannelTypeInfo>(initialState);
  // Changed type from string to ChannelTypeInfo | null to match the expected type
  const [selectedType, setSelectedType] = useState<ChannelTypeInfo | null>(null);

  return {
    formData,
    setFormData,
    selectedType,
    setSelectedType
  };
};


import React from "react";
import { ChannelTypeInfo } from "@/services/channelTypeService";

export const useFormInputHandlers = (
  setFormData: React.Dispatch<React.SetStateAction<ChannelTypeInfo>>
) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRichTextChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return {
    handleInputChange,
    handleRichTextChange
  };
};

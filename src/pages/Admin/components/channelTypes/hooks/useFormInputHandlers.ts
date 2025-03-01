
import { SetStateAction, Dispatch } from "react";
import { ChannelTypeInfo } from "@/services/channelTypeService";

export const useFormInputHandlers = (
  setFormData: Dispatch<SetStateAction<ChannelTypeInfo>>
) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRichTextChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return { handleInputChange, handleRichTextChange };
};
